import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Zap, Globe, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-rocket.jpg";
import logo from "@/assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Feature announcements" 
            className="w-full h-full object-cover animate-float"
          />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block glass px-4 py-2 rounded-full mb-4">
            <p className="text-sm text-primary font-medium">Announce Features Everywhere 🚀</p>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={logo} alt="Feature Blast Logo" className="w-20 h-20 animate-float" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="text-gradient">Feature Blast</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Turn your new features into perfectly crafted announcements for X, LinkedIn, changelogs, and in-app popups — in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Try Free
            </Button>
            <Button 
              variant="glass" 
              size="lg"
              onClick={() => navigate("/pricing")}
              className="text-lg px-8 py-6"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why <span className="text-gradient">Feature Blast?</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Rocket,
                title: "Launch Fast",
                description: "Create feature announcements in seconds, not hours"
              },
              {
                icon: Zap,
                title: "AI-Powered",
                description: "Let AI craft perfect copy for each platform"
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                description: "X, LinkedIn, changelogs, and in-app popups"
              },
              {
                icon: TrendingUp,
                title: "Track Impact",
                description: "Monitor impressions and engagement"
              }
            ].map((feature, i) => (
              <div key={i} className="glass-hover p-6 rounded-xl">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center glass-hover p-12 rounded-2xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to blast your features?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join indie hackers shipping features faster
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-12 py-6"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
