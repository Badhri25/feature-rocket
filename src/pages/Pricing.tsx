import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "3 features per month",
        "Basic AI announcements",
        "X & LinkedIn posts",
        "Changelog generation",
        "Made with Feature Blast badge",
      ],
      cta: "Get Started",
      variant: "glass" as const,
    },
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      features: [
        "Unlimited features",
        "Advanced AI announcements",
        "All platform types",
        "In-app popup embeds",
        "Remove badge",
        "Basic analytics",
      ],
      cta: "Start Free Trial",
      variant: "hero" as const,
      popular: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      features: [
        "Everything in Starter",
        "Priority AI processing",
        "Custom branding",
        "Advanced analytics",
        "API access",
        "Priority support",
      ],
      cta: "Start Free Trial",
      variant: "glass" as const,
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="glass" 
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Simple <span className="text-gradient">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your launch velocity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-hover p-8 rounded-2xl relative ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gradient">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.variant}
                className="w-full"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
