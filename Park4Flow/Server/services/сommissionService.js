const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'settings.json');

class CommissionService {
    // Read commission percent from config file
    static getCommissionPercent() {
        const rawData = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(rawData);
        return parseFloat(config.commission_percent);
    }

    // Update commission percent in config file
    static setCommissionPercent(newPercent) {
        if (newPercent < 0 || newPercent > 100) {
            throw new Error('Commission percent must be between 0 and 100.');
        }

        const config = { commission_percent: parseFloat(newPercent) };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    }

    // Calculate the total amount including commission
    static calculateTotalWithCommission(desiredAmount) {
        const percent = this.getCommissionPercent();
        const total = parseFloat(desiredAmount) * (1 + percent / 100);
        //return parseFloat(total.toFixed(2)); // Round to 2 decimals
        return Math.floor(total * 100) / 100;
    }
}

module.exports = CommissionService;
