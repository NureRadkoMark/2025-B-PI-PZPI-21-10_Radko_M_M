package com.example.bachelor_project_parking_system.views

import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContentProviderCompat.requireContext
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.example.bachelor_project_parking_system.databinding.ActivityPaymentBinding
import com.example.bachelor_project_parking_system.models.*
import com.example.bachelor_project_parking_system.models.Deposit.DepositRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.ConfirmResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayConfirmRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayPayPalCreateOrderResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.PayPalConfirmRequest
import com.example.bachelor_project_parking_system.models.Payment.PaymentRequest
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.*
import com.example.bachelor_project_parking_system.network.ViewModels.*
import com.example.bachelor_project_parking_system.network.ViewModels.Deposit.DepositViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.Deposit.DepositViewModelFactory
import com.example.bachelor_project_parking_system.network.ViewModels.Payment.PaymentViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.Payment.PaymentViewModelFactory
import com.example.bachelor_project_parking_system.utils.Constants
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.gson.Gson
import kotlinx.coroutines.launch

class PaymentActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPaymentBinding
    private lateinit var prefs: SharedPreferences
    private lateinit var sharedPrefs: SharedPreferences

    private val paymentViewModel: PaymentViewModel by viewModels {
        PaymentViewModelFactory(PaymentRepository(ApiServiceInstance.apiService))
    }

    private val depositViewModel: DepositViewModel by viewModels {
        DepositViewModelFactory(DepositRepository(ApiServiceInstance.apiService))
    }

    private var paymentMethod: String = ""
    private var transactionType: String = ""
    private var amount: Double = 0.0
    private var currency: String = "UAH"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = getSharedPreferences(Constants.SHARED_PREFS_NAME, MODE_PRIVATE)
        sharedPrefs = getSharedPreferences("jwt_prefs", MODE_PRIVATE)

        clearTransactionData()

        setupUI()
        observeViewModels()
        handleIntent()
    }

    private fun setupUI() {
        val currencies = listOf("UAH", "USD", "EUR")
        val currencyAdapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, currencies)
        binding.currencySelector.setAdapter(currencyAdapter)
        binding.currencySelector.setText(currencies.first(), false)

        updatePaymentMethods()

        binding.currencySelector.setOnItemClickListener { _, _, position, _ ->
            updatePaymentMethods()
        }

        binding.closeButton.setOnClickListener { finish() }
        binding.cancelButton.setOnClickListener { finish() }
        binding.payButton.setOnClickListener { initiateTransaction() }
    }

    private fun updatePaymentMethods() {
        currency = binding.currencySelector.text.toString()
        val methods = if (currency == "UAH") {
            listOf("LiqPay", "Balance")
        } else {
            listOf("LiqPay", "PayPal", "Balance")
        }

        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, methods)
        binding.paymentMethodSelector.setAdapter(adapter)
        if (methods.isNotEmpty()) {
            binding.paymentMethodSelector.setText(methods.first(), false)
        }
    }

    private fun handleIntent() {
        transactionType = intent.getStringExtra(Constants.TRANSACTION_TYPE) ?: ""

        when (transactionType) {
            Constants.TRANSACTION_TYPE_DEPOSIT -> {
                binding.paymentTitle.text = "Top Up Balance"
                binding.amountInput.isVisible = true
                binding.paymentAmountContainer.isVisible = false
                binding.bonusesCheckbox.isVisible = false
            }
            Constants.TRANSACTION_TYPE_PAYMENT -> {
                binding.paymentTitle.text = "Complete Payment"
                binding.amountInput.isVisible = false
                binding.paymentAmountContainer.isVisible = true
                binding.bonusesCheckbox.isVisible = true
                amount = intent.getStringExtra(Constants.AMOUNT)?.toDouble() ?: 0.0
                currency = intent.getStringExtra(Constants.CURRENCY) ?: "UAH"
                binding.paymentAmount.text = "%.2f %s".format(amount, currency)
            }
            else -> finish()
        }
    }

    private fun observeViewModels() {
        paymentViewModel.paymentPayPalCreateResponse.observe(this) { handlePaymentResponse(it) }
        paymentViewModel.paymentLiqPayCreateResponse.observe(this) { handlePaymentResponse(it) }
        paymentViewModel.paymentBalanceResponse.observe(this) { handleBalancePaymentResponse(it) }
        paymentViewModel.paymentPayPalConfirmResponse.observe(this) { handleConfirmationResponse(it) }
        paymentViewModel.paymentLiqPayConfirmResponse.observe(this) { handleConfirmationResponse(it) }
        paymentViewModel.error.observe(this) { showError(it) }

        depositViewModel.depositPayPalCreateResponse.observe(this) { handlePaymentResponse(it) }
        depositViewModel.depositLiqPayCreateResponse.observe(this) { handlePaymentResponse(it) }
        depositViewModel.depositPayPalConfirmResponse.observe(this) { handleConfirmationResponse(it) }
        depositViewModel.depositLiqPayConfirmResponse.observe(this) { handleConfirmationResponse(it) }
        depositViewModel.error.observe(this) { showError(it) }
    }

    private fun initiateTransaction() {
        if (!validateInput()) return

        paymentMethod = binding.paymentMethodSelector.text.toString()
        binding.progressBar.isVisible = true
        binding.payButton.isEnabled = false

        if (transactionType == Constants.TRANSACTION_TYPE_DEPOSIT) {
            amount = binding.amountInput.editText?.text.toString().toDouble()
        }

        currency = binding.currencySelector.text.toString()

        when (transactionType) {
            Constants.TRANSACTION_TYPE_DEPOSIT -> processDeposit()
            Constants.TRANSACTION_TYPE_PAYMENT -> processPayment()
        }
    }

    private fun processDeposit() {
        val token = sharedPrefs.getString("jwtToken", "") ?: ""
        val request = DepositRequest(
            currency = currency,
            desiredAmount = amount.toString()
        )

        when (paymentMethod) {
            "PayPal" -> depositViewModel.depositPayPalCreate(token, request)
            "LiqPay" -> depositViewModel.depositLiqPayCreate(token, request)
            "Balance" -> handleBalancePayment()
        }
    }

    private fun processPayment() {
        val token = sharedPrefs.getString("jwtToken", "") ?: ""
        val reservationId = prefs.getInt(Constants.RESERVATION_ID, 0)
        val payByBonuses = binding.bonusesCheckbox.isChecked

        val request = PaymentRequest(
            reservationId = reservationId,
            desiredAmount = amount.toString(),
            payByBonuses = payByBonuses,
            currency = currency
        )

        when (paymentMethod) {
            "PayPal" -> paymentViewModel.paymentPayPalCreate(token, request)
            "LiqPay" -> paymentViewModel.paymentLiqPayCreate(token, request)
            "Balance" -> paymentViewModel.paymentBalance(token, request)
        }
    }

    private fun handlePaymentResponse(response: LiqPayPayPalCreateOrderResponse) {
        prefs.edit().apply {
            putInt(Constants.TRANSACTION_ID, response.transactionID)
            putString(Constants.APPROVAL_URL, response.approvalUrl)
            apply()
        }

        try {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(response.approvalUrl))
            startActivity(browserIntent)
            showPaymentInstructionsDialog()
        } catch (e: Exception) {
            showError("Could not open payment page: ${e.message}")
        } finally {
            binding.progressBar.isVisible = false
            binding.payButton.isEnabled = true
        }
    }

    private fun handleBalancePaymentResponse(response: MessageResponse) {
        showSuccessDialog(response.Response ?: "Payment completed successfully!")
    }

    private fun handleBalancePayment() {
        // For direct balance payments without gateway
        showSuccessDialog("Balance topped up successfully!")
    }

    private fun handleConfirmationResponse(response: ConfirmResponse) {
        if (response.Response.contains("success", ignoreCase = true)) {
            showSuccessDialog("Payment confirmed successfully!")
        } else {
            showError("Payment confirmation failed")
        }
    }

    private fun showSuccessDialog(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Success")
            .setMessage(message)
            .setPositiveButton("OK") { _, _ ->
                setResult(RESULT_OK)
                finish()
            }
            .setCancelable(false)
            .show()
    }

    private fun showPaymentInstructionsDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Payment Instructions")
            .setMessage("Please complete the payment in the browser. Return to this app after payment.")
            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
            .setCancelable(false)
            .show()
    }

    private fun validateInput(): Boolean {
        if (transactionType == Constants.TRANSACTION_TYPE_DEPOSIT) {
            val amountText = binding.amountInput.editText?.text.toString()
            if (amountText.isEmpty() || amountText.toDouble() <= 0) {
                showError("Please enter a valid amount")
                return false
            }
        }

        if (binding.currencySelector.text.isNullOrEmpty()) {
            showError("Please select currency")
            return false
        }

        if (binding.paymentMethodSelector.text.isNullOrEmpty()) {
            showError("Please select payment method")
            return false
        }

        return true
    }

    private fun showError(message: String) {
        binding.progressBar.isVisible = false
        binding.payButton.isEnabled = true

        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    override fun onResume() {
        super.onResume()
        checkPendingTransaction()
    }

    private fun checkPendingTransaction() {
        val transactionId = prefs.getInt(Constants.TRANSACTION_ID, 0)
        val approvalUrl = prefs.getString(Constants.APPROVAL_URL, "") ?: ""

        if (transactionId != 0 && approvalUrl.isNotEmpty()) {
            confirmPendingTransaction(transactionId, approvalUrl)
        }
    }

    private fun confirmPendingTransaction(transactionId: Int, approvalUrl: String) {
        binding.progressBar.isVisible = true

        val token = sharedPrefs.getString("jwtToken", "") ?: ""
        val amountStr = String.format("%.2f", amount).replace(",", ".")

        val request = LiqPayConfirmRequest(
            transactionID = transactionId,
            desiredAmount = String.format("%.2f", amount).replace(",", ".")
        )

        // Логируем JSON-запрос перед отправкой
        val gson = Gson()
        val json = gson.toJson(request)
        Log.d("PAYMENT_LOG", "LiqPayConfirmRequest: $json")

        lifecycleScope.launch {
            try {
                when (transactionType) {
                    Constants.TRANSACTION_TYPE_DEPOSIT -> {
                        when (paymentMethod) {
                            "PayPal" -> {
                                val request = PayPalConfirmRequest(
                                    transactionID = transactionId,
                                    approvalUrl = approvalUrl,
                                    desiredAmount = amountStr
                                )
                                depositViewModel.depositPayPalConfirm(token, request)
                            }
                            "LiqPay" -> {
                                val request = LiqPayConfirmRequest(
                                    transactionID = transactionId,
                                    desiredAmount = amountStr
                                )
                                depositViewModel.depositLiqPayConfirm(token, request)
                            }
                        }
                    }
                    Constants.TRANSACTION_TYPE_PAYMENT -> {
                        when (paymentMethod) {
                            "PayPal" -> {
                                val request = PayPalConfirmRequest(
                                    transactionID = transactionId,
                                    approvalUrl = approvalUrl,
                                    desiredAmount = amountStr
                                )
                                paymentViewModel.paymentPayPalConfirm(token, request)
                            }
                            "LiqPay" -> {
                                val request = LiqPayConfirmRequest(
                                    transactionID = transactionId,
                                    desiredAmount = amountStr
                                )
                                paymentViewModel.paymentLiqPayConfirm(token, request)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                showError("Confirmation failed: ${e.message}")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isFinishing) {
            clearTransactionData()
        }
    }

    private fun clearTransactionData() {
        prefs.edit().apply {
            remove(Constants.TRANSACTION_TYPE)
            remove(Constants.AMOUNT)
            remove(Constants.CURRENCY)
            remove(Constants.RESERVATION_ID)
            remove(Constants.TRANSACTION_ID)
            remove(Constants.APPROVAL_URL)
            apply()
        }
    }
}