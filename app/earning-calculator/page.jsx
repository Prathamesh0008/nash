"use client";

import { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  Zap,
  CheckCircle,
  Calendar
} from 'lucide-react';

const EarningCalculator = () => {
  const [inputs, setInputs] = useState({
    hourlyRate: 50,
    hoursPerDay: 8,
    daysPerWeek: 5,
    weeksPerMonth: 4,
    commissionRate: 20,
    bonus: 0,
    ratingMultiplier: 1.0
  });

  const [results, setResults] = useState({
    dailyEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    afterCommission: 0,
    totalWithBonus: 0
  });

  // Worker types with different base rates
  const workerTypes = [
    { id: 'standard', name: 'Standard Worker', rate: 40, icon: '👷', color: 'blue' },
    { id: 'skilled', name: 'Skilled Professional', rate: 65, icon: '👨‍🔧', color: 'purple' },
    { id: 'expert', name: 'Expert Specialist', rate: 90, icon: '👨‍🏫', color: 'green' },
    { id: 'premium', name: 'Premium Service', rate: 120, icon: '👑', color: 'amber' }
  ];

  // Rating multipliers
  const ratings = [
    { value: 1.0, label: '⭐ 4.0 Stars', desc: 'Standard Rate' },
    { value: 1.2, label: '⭐⭐ 4.5 Stars', desc: '+20% Premium' },
    { value: 1.5, label: '⭐⭐⭐ 5.0 Stars', desc: '+50% Premium' }
  ];

  // Calculate earnings whenever inputs change
  useEffect(() => {
    const calculateEarnings = () => {
      const {
        hourlyRate,
        hoursPerDay,
        daysPerWeek,
        weeksPerMonth,
        commissionRate,
        bonus,
        ratingMultiplier
      } = inputs;

      // Apply rating multiplier to base rate
      const effectiveHourlyRate = hourlyRate * ratingMultiplier;
      
      // Calculate gross earnings
      const dailyGross = effectiveHourlyRate * hoursPerDay;
      const weeklyGross = dailyGross * daysPerWeek;
      const monthlyGross = weeklyGross * weeksPerMonth;
      const yearlyGross = monthlyGross * 12;
      
      // Calculate commission
      const commission = (monthlyGross * commissionRate) / 100;
      const monthlyAfterCommission = monthlyGross - commission;
      
      // Add bonus
      const totalWithBonus = monthlyAfterCommission + parseInt(bonus);

      setResults({
        dailyEarnings: dailyGross,
        weeklyEarnings: weeklyGross,
        monthlyEarnings: monthlyGross,
        yearlyEarnings: yearlyGross,
        afterCommission: monthlyAfterCommission,
        totalWithBonus: totalWithBonus
      });
    };

    calculateEarnings();
  }, [inputs]);

  const handleInputChange = (name, value) => {
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectWorkerType = (type) => {
    setInputs(prev => ({
      ...prev,
      hourlyRate: type.rate
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-100 rounded-full">
              <Calculator className="w-12 h-12 text-pink-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Earning Calculator
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Estimate your potential earnings as a professional worker on <span className="text-pink-600 font-semibold">Valentina's</span> platform. 
            Adjust the parameters to see how much you could earn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calculator Inputs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Worker Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Your Worker Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {workerTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => selectWorkerType(type)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      inputs.hourlyRate === type.rate
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatCurrency(type.rate)}/hr
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculator Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Adjust Your Parameters
              </h2>
              
              <div className="space-y-6">
                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Hourly Rate
                    </div>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="5"
                      value={inputs.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-lg font-bold text-pink-600 min-w-[100px]">
                      {formatCurrency(inputs.hourlyRate)}/hr
                    </div>
                  </div>
                </div>

                {/* Hours & Days */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Hours Per Day
                      </div>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={inputs.hoursPerDay}
                      onChange={(e) => handleInputChange('hoursPerDay', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-2">
                      <span className="text-lg font-bold text-gray-900">{inputs.hoursPerDay} hours</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Days Per Week
                      </div>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={inputs.daysPerWeek}
                      onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-2">
                      <span className="text-lg font-bold text-gray-900">{inputs.daysPerWeek} days</span>
                    </div>
                  </div>
                </div>

                {/* Rating Multiplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Customer Rating Impact
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {ratings.map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleInputChange('ratingMultiplier', rating.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          inputs.ratingMultiplier === rating.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{rating.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{rating.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bonus Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Bonus/Extra Earnings
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="100"
                      value={inputs.bonus}
                      onChange={(e) => handleInputChange('bonus', parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter bonus amount"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white sticky top-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Your Estimated Earnings
              </h2>

              <div className="space-y-6">
                {/* Daily Earnings */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="text-sm opacity-90">Daily Earnings</div>
                  <div className="text-3xl font-bold mt-1">
                    {formatCurrency(results.dailyEarnings)}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    {inputs.hoursPerDay} hours × {formatCurrency(inputs.hourlyRate * inputs.ratingMultiplier)}/hr
                  </div>
                </div>

                {/* Weekly Earnings */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="text-sm opacity-90">Weekly Earnings</div>
                  <div className="text-3xl font-bold mt-1">
                    {formatCurrency(results.weeklyEarnings)}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    {inputs.daysPerWeek} days × {formatCurrency(results.dailyEarnings)}/day
                  </div>
                </div>

                {/* Monthly Earnings */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="text-sm opacity-90">Monthly Earnings (Gross)</div>
                  <div className="text-3xl font-bold mt-1">
                    {formatCurrency(results.monthlyEarnings)}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    {inputs.weeksPerMonth} weeks × {formatCurrency(results.weeklyEarnings)}/week
                  </div>
                </div>

                {/* After Commission */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm opacity-90">After Commission ({inputs.commissionRate}%)</div>
                      <div className="text-3xl font-bold mt-1">
                        {formatCurrency(results.afterCommission)}
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-300" />
                  </div>
                </div>

                {/* Total with Bonus */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border-2 border-yellow-300/30">
                  <div className="text-sm opacity-90">Total Monthly Income</div>
                  <div className="text-4xl font-bold mt-2">
                    {formatCurrency(results.totalWithBonus)}
                  </div>
                  {inputs.bonus > 0 && (
                    <div className="text-sm opacity-90 mt-2">
                      + {formatCurrency(inputs.bonus)} bonus included
                    </div>
                  )}
                </div>

                {/* Yearly Projection */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="text-sm opacity-90">Yearly Projection</div>
                  <div className="text-3xl font-bold mt-1">
                    {formatCurrency(results.yearlyEarnings * 12)}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    Potential annual income
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-white text-pink-600 hover:bg-gray-100 font-bold py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                  Join Valentina's Platform
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">Timely and protected payments guaranteed</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Verified Clients</h3>
            <p className="text-gray-600">Work with trusted, verified customers</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Rating Benefits</h3>
            <p className="text-gray-600">Higher ratings lead to better earnings</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            * These are estimated earnings. Actual earnings may vary based on demand, 
            availability, and performance. Commission rates and bonuses are subject to change.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarningCalculator;

// Additional icons component
const ShieldCheck = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);