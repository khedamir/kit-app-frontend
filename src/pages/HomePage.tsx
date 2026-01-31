import { Link } from "react-router-dom";
import {
  Users,
  Target,
  MessageSquare,
  Award,
  ArrowRight,
  Sparkles,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

const features = [
  {
    icon: Target,
    title: "Карта навыков",
    description: "Заполни анкету навыков и интересов, чтобы система могла подобрать для тебя рекомендации",
  },
  {
    icon: Users,
    title: "Поиск команды",
    description: "Находи единомышленников с общими интересами или дополняющими навыками для проектов",
  },
  {
    icon: MessageSquare,
    title: "Форум",
    description: "Общайся с другими студентами, задавай вопросы и делись опытом",
  },
  {
    icon: Award,
    title: "Магазин",
    description: "Зарабатывай баллы за активность и обменивай их на призы и бонусы",
  },
];

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="text-center py-8">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          Добро пожаловать в{" "}
          <span className="text-primary">KIT Platform</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Платформа для студентов КИТ — находи единомышленников, формируй команды 
          для проектной деятельности и развивай свои навыки вместе
        </p>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/profile">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Мой профиль
            </Button>
          </Link>
          <Link to="/recommendations">
            <Button size="lg" variant="outline" className="gap-2">
              <Users className="w-5 h-5" />
              Найти команду
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Возможности платформы</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Готов к проектной работе?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Заполни карту навыков и найди идеальных партнёров для своего следующего проекта
          </p>
          <Link to="/recommendations">
            <Button size="lg" className="gap-2">
              Начать поиск
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* User greeting */}
      {user && (
        <div className="text-center text-sm text-muted-foreground pb-4">
          Вы вошли как <span className="font-medium text-foreground">{user.email}</span>
        </div>
      )}
    </div>
  );
}
