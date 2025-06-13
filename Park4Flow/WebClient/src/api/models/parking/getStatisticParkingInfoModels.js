export const getStatisticParkingInfoResponseModel = () => ({
    tariffPlan: '', 

    statistics: {
        totalPlaces: 0,
        takenPlaces: 0,
        freePlaces: 0,
        averagePrice: '0.00',
        minPrice: '0.00',
        maxPrice: '0.00',
        demandFactor: 0,
        parkingBalance: 0,
        currency: 'UAH',
        PhotoImage: '',

        reservationCount: 0,
        projectedLoad: {
            peakHour: 0,
            hourlyUsage: Array(24).fill(0),
            recommendation: ''
        }
    },

    analyticsCharts: {
        dailyReservations: [],   // [{ date: '2025-05-01', count: 3 }]
        hourlyReservations: [],  // [{ hour: 14, count: 5 }]
        revenueChart: [],        // [{ date: '2025-05-01', amount: 120.00 }]
        payoutChart: []          // [{ date: '2025-05-01', amount: 80.00 }]
    }
});