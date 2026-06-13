/**
 * HomePage
 * Landing/home page
 */

import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { Activity, Zap, Brain, BarChart3 } from "lucide-react";
import Logo from "../../src/assets/images/app_logo.png";

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/dashboard");
  }

  const features = [
    {
      icon: Activity,
      title: "Track Everything",
      description: "Log calories, workouts, and weight all in one place",
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Get personalized recommendations from advanced AI",
    },
    {
      icon: Zap,
      title: "Smart Chat",
      description: "Chat with AI for real-time fitness advice",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Visualize your progress with beautiful charts",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="ActiveAura Logo" className="h-10 w-20  " />
            <h1 className="text-2xl font-bold text-primary-600">ActiveAura</h1>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Your AI Fitness Companion
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Track your fitness journey with AI-powered insights, personalized
          goals, and intelligent chatbot guidance.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/signup">
            <Button variant="primary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-16">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary-600" size={32} />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-4">
          Ready to Transform Your Fitness?
        </h3>
        <p className="text-gray-600 mb-8">
          Join thousands of users achieving their fitness goals
        </p>
        <Link to="/signup">
          <Button variant="primary" size="lg">
            Start Your Free Trial
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 ActiveAura. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
