import { CheckCircle, Shield, Star, Eye, Lock, Users, Bell, TrendingUp, MessageSquare, BarChart, Headphones, Crown } from 'lucide-react';

const MembershipBenefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Advanced protection for your privacy and data'
    },
    {
      icon: Eye,
      title: 'Better Visibility',
      description: 'Stand out in search results and get noticed'
    },
    {
      icon: Star,
      title: 'Exclusive Access',
      description: 'Access premium clients and exclusive events'
    },
    {
      icon: CheckCircle,
      title: 'Priority Verification',
      description: 'Fast-track verification process'
    },
    {
      icon: TrendingUp,
      title: 'Top Search Results',
      description: 'Appear first in relevant searches'
    },
    {
      icon: Users,
      title: 'VIP Clients',
      description: 'Connect with high-profile, verified clients'
    },
    {
      icon: MessageSquare,
      title: 'Encrypted Chat',
      description: 'Secure, private messaging system'
    },
    {
      icon: Bell,
      title: 'Featured Listing',
      description: 'Premium placement on the platform'
    },
    {
      icon: Star,
      title: 'Premium Events',
      description: 'Invitations to exclusive gatherings'
    },
    {
      icon: Lock,
      title: 'Discretion Mode',
      description: 'Control your visibility and privacy'
    },
    {
      icon: BarChart,
      title: 'Profile Analytics',
      description: 'Detailed insights into your profile performance'
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: '24/7 dedicated customer support'
    }
  ];

  const tiers = [
    {
      name: 'Basic',
      price: 'Free',
      features: ['Standard Security', 'Basic Visibility', 'Regular Support'],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      features: ['Enhanced Security', 'Better Visibility', 'Priority Verification', 'Profile Analytics'],
      highlighted: false
    },
    {
      name: 'Elite',
      price: '$199',
      period: '/month',
      features: ['All Premium Features', 'VIP Client Access', '24/7 Priority Support', 'Exclusive Events'],
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Elite <span className="text-yellow-500">Membership</span> Benefits
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-2xl mx-auto px-4">
            Unlock exclusive features and premium access designed for top-tier creators
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">
            Premium <span className="text-yellow-500">Features</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
                      <Icon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">
            Choose Your <span className="text-yellow-500">Plan</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-6 md:p-8 ${tier.highlighted 
                  ? 'bg-gray-800 border-2 border-yellow-500' 
                  : 'bg-gray-800/80 border border-gray-700'
                }`}
              >
                {tier.highlighted && (
                  <div className="flex justify-center mb-6">
                    <span className="bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                )}
                
                <h3 className={`text-xl md:text-2xl font-bold text-center mb-6 ${tier.highlighted ? 'text-yellow-500' : 'text-white'}`}>
                  {tier.name}
                </h3>
                
                <div className="text-center mb-8">
                  <span className="text-3xl md:text-4xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-gray-400 ml-2">{tier.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${tier.highlighted ? 'text-yellow-500' : 'text-green-500'}`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3.5 rounded-lg font-medium transition-all duration-200 ${tier.highlighted 
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {tier.highlighted ? 'Upgrade to Elite' : `Select ${tier.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-800 rounded-xl p-8 md:p-10 text-center border border-gray-700 mb-16 md:mb-20">
          <div className="max-w-3xl mx-auto">
            <Crown className="w-12 h-12 md:w-14 md:h-14 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Ready to Elevate Your Experience?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of elite creators who have transformed their success with our premium membership
            </p>
            <button className="bg-yellow-500 text-gray-900 font-semibold py-3.5 px-8 rounded-lg text-lg hover:bg-yellow-600 transition-colors duration-200">
              Start Your Elite Journey
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-700 pt-12 md:pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '99%', label: 'Client Satisfaction' },
              { value: '24/7', label: 'Support Available' },
              { value: '5K+', label: 'Elite Members' },
              { value: '30d', label: 'Money-Back Guarantee' }
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-yellow-500">{stat.value}</div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipBenefits;
