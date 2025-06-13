const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    UserID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Email: { type: DataTypes.STRING, allowNull: false , unique: true},
    Password: { type: DataTypes.STRING, allowNull: false },
    FirstName: { type: DataTypes.STRING, allowNull: false },
    SecondName: { type: DataTypes.STRING, allowNull: false },
    PhoneNumber: { type: DataTypes.STRING, allowNull: false , unique: true},
    RegisterDate: {type: DataTypes.DATE, allowNull: false },
    Role: {type: DataTypes.STRING, allowNull: false },
    IsBanned: {type: DataTypes.BOOLEAN, defaultValue: false},
    IsBusiness: {type: DataTypes.BOOLEAN, defaultValue: false},
    SecurityCode: {type: DataTypes.STRING(6), allowNull: true, unique: true},
    Bonuses: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
});

const Notification = sequelize.define('Notification', {
    NotificationID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true } ,
    Type: {type: DataTypes.STRING, allowNull: false},
    Body: {type: DataTypes.STRING, allowNull: false},
    DateAndTime: {type: DataTypes.DATE, allowNull: false},
    Language: { type: DataTypes.STRING, allowNull: false, defaultValue: 'en' },
});

const UserBalance = sequelize.define('UserBalance', {
    UserBalanceID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Balance: {type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00},
    Currency: {type: DataTypes.STRING(3), allowNull: false, defaultValue: "UAH"}
});

const UserDebt = sequelize.define('UserDebt', {
    UserDebtID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Amount: {type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00},
    Currency: {type: DataTypes.STRING(3), allowNull: false},
    isRepaid: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    DateAndTime: {type: DataTypes.DATE, allowNull: false}
});

const BonusesCost = sequelize.define('BonusesCost', {
    BonusesCostID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Currency: {type: DataTypes.STRING(3), allowNull: false},
    AmountForOneBonus: {type: DataTypes.DECIMAL(15, 2), allowNull: false}
});

const Vehicle = sequelize.define('Vehicle', {
    VehicleID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    VehicleCategory: {type: DataTypes.STRING(1), allowNull: false, defaultValue: "B"},
    StateNumber: {type: DataTypes.STRING(80), allowNull: false},
    VehicleBrand: {type: DataTypes.STRING, allowNull: false},
    VehicleModel: {type: DataTypes.STRING, allowNull: false},
    FrontPhotoImage: {type: DataTypes.STRING, allowNull: false}
});

const Subscription = sequelize.define('Subscription', {
    SubscriptionID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    SubscriptionEnd: {type: DataTypes.DATE, allowNull: false},
    isActive: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
});

const ParkingAction = sequelize.define('ParkingAction', {
    ParkingActionID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    StartTime: {type: DataTypes.DATE, allowNull: false},
    EndTime: {type: DataTypes.DATE, allowNull: true},
    TotalFee: {type: DataTypes.DECIMAL(15, 2), allowNull: false},
    Currency: {type: DataTypes.STRING(3), allowNull: false},
    Status: {type: DataTypes.STRING, allowNull: false}
});

const ParkingManager = sequelize.define('ParkingManager', {
    Role: {type: DataTypes.STRING, allowNull: false}, //Owner, Admin
});

const SubPay = sequelize.define('SubPay', {
    SubPayID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Amount: {type: DataTypes.DECIMAL(15, 2), allowNull: false},
    Currency: {type: DataTypes.STRING(3), allowNull: false},
    DateAndTime: {type: DataTypes.DATE, allowNull: false},
    PayPurpose: {type: DataTypes.STRING, allowNull: true}
});

const ParkPay = sequelize.define('ParkPay', {
    ParkPayID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});

const FavouriteParking = sequelize.define('FavouriteParking', {
    FavouriteParkingID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});

const CancellationPolicies = sequelize.define('CancellationPolicies', {
    CancellationPoliciesID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    HoursBeforeStart: {type: DataTypes.TIME, allowNull: false},
    CancellationFeePercent: {type: DataTypes.DECIMAL(3, 2), allowNull: false }
});

const SalesPolicies = sequelize.define('SalesPolicies', {
    SalesPoliciesID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    IsForEveryone: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    SalePercent: { type: DataTypes.DECIMAL(3, 2), allowNull: false }
});

const Parking = sequelize.define('Parking', {
    ParkingID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Address: {type: DataTypes.STRING(30), allowNull: false},
    Name: {type: DataTypes.STRING(20), allowNull: false},
    Info: {type: DataTypes.STRING, allowNull: false},
    IsActive: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    Longitude: {type: DataTypes.DECIMAL(18, 15), allowNull: false},
    Latitude: {type: DataTypes.DECIMAL(18, 15), allowNull: false},
    DynamicPricing: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    DemandFactor: {type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 1.00, validate: {
            min: 1.0,
            max: 3.0,
        },},
    PhotoImage: {type: DataTypes.STRING, allowNull: false}
});

const ParkingBalance =  sequelize.define('ParkingBalance', {
    ParkingBalanceID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Balance: {type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00},
    Currency: {type: DataTypes.STRING(3), allowNull: false, defaultValue: "UAH"}
});

const ParkPlace = sequelize.define('ParkPlace', {
    ParkPlaceID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    VehicleCategory: {type: DataTypes.STRING(1), allowNull: false, defaultValue: "B"},
    PlaceCategory: {type: DataTypes.STRING, allowNull: false},
    Name: {type: DataTypes.STRING, allowNull: false},
    Longitude: {type: DataTypes.DECIMAL(18, 15), allowNull: true},
    Latitude: {type: DataTypes.DECIMAL(18, 15), allowNull: true},
    BasePrice: {type: DataTypes.DECIMAL(15, 2), allowNull: false},
    CurrentPrice: {type: DataTypes.DECIMAL(15, 2), allowNull: false},
    Currency: {type: DataTypes.STRING(3), allowNull: false, defaultValue: "UAH"},
    PriceTimeDuration: {type: DataTypes.TIME, allowNull: false},
    IsTaken: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
});

const Reservation = sequelize.define('Reservation', {
    ReservationID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    DateAndTime: {type: DataTypes.DATE, allowNull: false},
    StartTime: {type: DataTypes.DATE, allowNull: false},
    EndTime: {type: DataTypes.DATE, allowNull: false},
    Status: {type: DataTypes.STRING, allowNull: false} //created, skipped, expired, used
});

const Transaction = sequelize.define('Transaction', {
    TransactionID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Type: {type: DataTypes.STRING, allowNull: false}, //deposit, payment, refund, debt, revenue, payout
    Amount: {type: DataTypes.DECIMAL(15, 2), allowNull: false},
    Currency: {type: DataTypes.STRING(3), allowNull: false},
    PaymentSource: {type: DataTypes.STRING, allowNull: false}, //balance, liqpay, paypal, mixed
    DateAndTime: {type: DataTypes.DATE, allowNull: false},
    Status: {type: DataTypes.STRING, allowNull: false}, //CREATED, success
    Info: {type: DataTypes.STRING, allowNull: true}
});

const TariffPlan = sequelize.define('TariffPlan', {
    TariffPlanID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    SubscriptionDuration: {type: DataTypes.INTEGER, allowNull: false},
    SubscriptionPrice: {type: DataTypes.DECIMAL(15, 2), allowNull: false},
    Currency: {type: DataTypes.STRING(3), allowNull: false},
    Type: {type: DataTypes.STRING, allowNull: false} // base, extended, enterprise
});

User.belongsToMany(Parking, {
    through: ParkingManager
})

Parking.belongsToMany(User, {
    through: ParkingManager
})

User.belongsToMany(Parking, {
    through: FavouriteParking
})

Parking.belongsToMany(User, {
    through: FavouriteParking
})

User.hasMany(Notification)
Notification.belongsTo(User)

User.hasOne(UserBalance)
UserBalance.belongsTo(User)

User.hasMany(UserDebt)
UserDebt.belongsTo(User)

User.hasMany(Vehicle)
Vehicle.belongsTo(User)

User.hasOne(Subscription)
Subscription.belongsTo(User)

User.hasMany(Transaction)
Transaction.belongsTo(User)

UserDebt.hasOne(Transaction)
Transaction.belongsTo(UserDebt)

User.hasMany(SalesPolicies)
SalesPolicies.belongsTo(User)

User.hasMany(SubPay)
SubPay.belongsTo(User)

Vehicle.hasMany(ParkingAction)
ParkingAction.belongsTo(Vehicle)

Parking.hasMany(UserDebt)
UserDebt.belongsTo(Parking)

Parking.hasMany(CancellationPolicies)
CancellationPolicies.belongsTo(Parking)

Parking.hasMany(ParkPlace)
ParkPlace.belongsTo(Parking)

Parking.hasOne(ParkingBalance)
ParkingBalance.belongsTo(Parking)

Parking.hasMany(SalesPolicies)
SalesPolicies.belongsTo(Parking)

ParkPlace.hasMany(Reservation)
Reservation.belongsTo(ParkPlace)

ParkPlace.hasMany(ParkingAction)
ParkingAction.belongsTo(ParkPlace)

Transaction.hasOne(ParkPay)
ParkPay.belongsTo(Transaction)

ParkingAction.hasOne(ParkPay)
ParkPay.belongsTo(Transaction)

Vehicle.hasMany(Reservation)
Reservation.belongsTo(Vehicle)

Reservation.hasMany(Transaction)
Transaction.belongsTo(Reservation)

TariffPlan.hasMany(SubPay)
SubPay.belongsTo(TariffPlan)

SubPay.hasOne(Subscription)
Subscription.belongsTo(SubPay)

module.exports = {
    Notification,
    BonusesCost,
    Vehicle,
    UserBalance,
    UserDebt,
    Subscription,
    User,
    ParkingAction,
    ParkingManager,
    SubPay,
    ParkPay,
    FavouriteParking,
    CancellationPolicies,
    SalesPolicies,
    Parking,
    Reservation,
    TariffPlan,
    ParkPlace,
    Transaction,
    ParkingBalance
}

