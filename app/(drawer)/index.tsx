import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";

// أيقونات من lucide-react-native
import {
  Search,
  Droplets,
  Calculator,
  Activity,
  Atom,
  Gauge,
  Ruler,
  Square,
  Package,
  Scale,
  Thermometer,
  BarChart3,
  Zap,
  Waves,
  FlaskConical,
} from "lucide-react-native";

type CalcItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  tags: string[];
};

type Group = {
  id: string;
  title: string;
  color: string;
  items: CalcItem[];
};

// المجموعات + المسارات الصحيحة
const GROUPS: Group[] = [
  {
    id: "hydraulics",
    title: "🟦 الهيدروليك والمضخات",
    color: "#1e40af",
    items: [
      {
        id: "process-flow",
        title: "حسابات تدفق العمليات",
        description: "حساب العلاقة بين سرعة المائع ومعدل التدفق",
        icon: <Waves color="#ffffff" size={24} />,
        route: "/calculators/process-flow",
        tags: ["hydraulic", "flow", "سرعة", "تدفق"],
      },
      {
        id: "pressure-converter",
        title: "محول الضغط",
        description: "التحويل بين وحدات الضغط المختلفة",
        icon: <BarChart3 color="#ffffff" size={24} />,
        route: "/calculators/pressure-converter",
        tags: ["ضغط", "bar", "kPa", "psi"],
      },
      {
        id: "whp-bhp",
        title: "قدرة العمود (WHP/BHP)",
        description: "حساب القدرة المائية والفرامل للمضخة",
        icon: <Zap color="#ffffff" size={24} />,
        route: "/calculators/pumps/whp-bhp",
        tags: ["pump", "whp", "bhp"],
      },
      {
        id: "tdh",
        title: "الضاغط الديناميكي الكلي (TDH)",
        description: "حساب TDH باستخدام Hazen–Williams والخسائر",
        icon: <Zap color="#ffffff" size={24} />,
        route: "/calculators/pumps/tdh",
        tags: ["pump", "tdh"],
      },
      {
        id: "affinity",
        title: "قوانين التقارب (Affinity)",
        description: "حساب التغير مع السرعة/القطر",
        icon: <Zap color="#ffffff" size={24} />,
        route: "/calculators/pumps/affinity",
        tags: ["pump", "affinity"],
      },
    ],
  },
  {
    id: "electrical",
    title: "🟩 الكهرباء والطاقة",
    color: "#16a34a",
    items: [
      {
        id: "three-phase",
        title: "تيار 3 فاز والقدرة الظاهرية",
        description: "حساب التيار والقدرة الظاهرية حسب PF والكفاءة",
        icon: <Zap color="#ffffff" size={24} />,
        route: "/calculators/electrical/three-phase",
        tags: ["3phase", "kVA", "pf", "current"],
      },
    ],
  },
  {
    id: "ro",
    title: "🟨 التحلية (RO)",
    color: "#f59e0b",
    items: [
      {
        id: "tds",
        title: "محول TDS والناقلية",
        description: "تحويل بين مجموع الأملاح الذائبة والناقلية الكهربائية",
        icon: <Droplets color="#ffffff" size={24} />,
        route: "/calculators/tds-converter",
        tags: ["RO", "TDS", "EC", "تحويل"],
      },
      {
        id: "osmotic-pressure",
        title: "حاسبة الضغط الأسموزي",
        description: "حساب الضغط الأسموزي للمحاليل",
        icon: <Gauge color="#ffffff" size={24} />,
        route: "/calculators/osmotic-pressure",
        tags: ["RO", "osmotic", "π", "ضغط"],
      },
      {
        id: "ro-basics",
        title: "أساسيات RO",
        description: "حساب Recovery, Salt Rejection, CF...",
        icon: <Gauge color="#ffffff" size={24} />,
        route: "/calculators/ro/basics",
        tags: ["RO", "recovery", "CF"],
      },
    ],
  },
  {
    id: "dosing",
    title: "🟧 الجرعات الكيميائية",
    color: "#f97316",
    items: [
      {
        id: "molecular-weight",
        title: "حاسبة الوزن الجزيئي",
        description: "حساب الوزن الجزيئي للمركبات الكيميائية",
        icon: <Atom color="#ffffff" size={24} />,
        route: "/calculators/molecular-weight",
        tags: ["جرعات", "MW", "molar", "كيمياء"],
      },
      {
        id: "c1v1",
        title: "C1V1 = C2V2 (تخفيف)",
        description: "أدخل 3 قيم واحسب الرابعة",
        icon: <FlaskConical color="#ffffff" size={24} />,
        route: "/calculators/dosing/c1v1",
        tags: ["dosing", "dilution", "تحضير"],
      },
      {
        id: "chlorine-dose",
        title: "جرعة الكلور / الهيبو",
        description: "حساب معدل حقن محلول NaOCl",
        icon: <FlaskConical color="#ffffff" size={24} />,
        route: "/calculators/dosing/chlorine-dose",
        tags: ["dosing", "chlorine"],
      },
      {
        id: "acid-alkali-dose",
        title: "جرعات الأحماض/القلويات",
        description: "حساب معدل الحقن المطلوب لتعديل pH/Alk",
        icon: <FlaskConical color="#ffffff" size={24} />,
        route: "/calculators/dosing/acid-alkali-dose",
        tags: ["dosing", "acid", "alkali"],
      },
    ],
  },
  {
    id: "indices",
    title: "🟥 مؤشرات الترسب والتآكل",
    color: "#ef4444",
    items: [
      {
        id: "lsi-rsi",
        title: "مؤشر لانجليير وريزنر",
        description: "حساب قابلية الماء للترسيب أو التآكل (LSI & RSI)",
        icon: <Activity color="#ffffff" size={24} />,
        route: "/calculators/indices/lsi-rsi",
        tags: ["LSI", "RSI", "ترسب", "تآكل"],
      },
    ],
  },
  {
    id: "conversions",
    title: "🟪 التحويلات والوحدات",
    color: "#8b5cf6",
    items: [
      {
        id: "hardness",
        title: "محول عسر الماء",
        description: "تحويل بين وحدات عسر الماء المختلفة",
        icon: <Calculator color="#ffffff" size={24} />,
        route: "/calculators/hardness-converter",
        tags: ["عسر", "صلابة", "dH", "CaCO3"],
      },
      {
        id: "length-converter",
        title: "محول وحدات الطول",
        description: "التحويل السريع بين مختلف وحدات قياس الطول",
        icon: <Ruler color="#ffffff" size={24} />,
        route: "/calculators/length-converter",
        tags: ["طول", "mm", "cm", "m"],
      },
      {
        id: "surface-calculator",
        title: "حاسبة المساحة",
        description: "حساب مساحة الأشكال الهندسية الشائعة",
        icon: <Square color="#ffffff" size={24} />,
        route: "/calculators/surface-calculator",
        tags: ["مساحة", "هندسة", "surface"],
      },
      {
        id: "volume-converter",
        title: "محول وحدات الحجم",
        description: "التحويل بين وحدات الحجم المختلفة",
        icon: <Package color="#ffffff" size={24} />,
        route: "/calculators/volume-converter",
        tags: ["حجم", "L", "m3", "gal"],
      },
      {
        id: "mass-converter",
        title: "محول الكتلة",
        description: "التحويل بين مختلف وحدات قياس الكتلة",
        icon: <Scale color="#ffffff" size={24} />,
        route: "/calculators/mass-converter",
        tags: ["كتلة", "kg", "g", "lb"],
      },
      {
        id: "temperature-converter",
        title: "محول درجة الحرارة",
        description: "التحويل بين وحدات الحرارة الأساسية",
        icon: <Thermometer color="#ffffff" size={24} />,
        route: "/calculators/temperature-converter",
        tags: ["حرارة", "C", "F", "K"],
      },
      {
        id: "volume-flow-converter",
        title: "محول وحدات تدفق الحجم",
        description: "التحويل بين وحدات قياس معدل التدفق الحجمي",
        icon: <FlaskConical color="#ffffff" size={24} />,
        route: "/calculators/volume-flow-converter",
        tags: ["تدفق", "m3/h", "L/s", "gpm"],
      },
      {
        id: "flow",
        title: "محول التدفق (Flow)",
        description: "تحويلات خاصة بالتدفق",
        icon: <Waves color="#ffffff" size={24} />,
        route: "/calculators/conversions/flow",
        tags: ["flow", "تدفق"],
      },
    ],
  },
];

export default function HomeGroupedScreen() {
  const { theme } = useTheme();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return GROUPS;
    const k = q.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (it) =>
          it.title.toLowerCase().includes(k) ||
          it.description.toLowerCase().includes(k) ||
          it.tags.join(" ").toLowerCase().includes(k)
      ),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  const go = (route: string) => router.push(route as any);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Content with proper spacing from header */}
      <View style={styles.contentWrapper}>
        {/* البحث */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Search color={theme.colors.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="ابحث بالاسم أو الوسوم (RO، TDS، LSI، gpm...)"
            placeholderTextColor={theme.colors.textSecondary}
            value={q}
            onChangeText={setQ}
          />
        </View>

        {/* القوائم المجمّعة */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.groupsWrap}>
            {filtered.map((g) => (
              <View key={g.id} style={styles.groupBlock}>
                <Text style={[styles.groupTitle, { color: g.color }]}>{g.title}</Text>
                {g.items.map((it) => (
                  <TouchableOpacity
                    key={it.id}
                    style={[styles.card, { backgroundColor: theme.colors.surface }]}
                    onPress={() => go(it.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardIcon}>{it.icon}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{it.title}</Text>
                      <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>{it.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              مصمم للمختبرات ومحطات تحلية المياه في الجزائر
            </Text>
            <Text style={[styles.creditText, { color: theme.colors.textSecondary }]}>عبدالحق زيتون ♥ Ai</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    flex: 1,
    paddingTop: 16, // Comfortable spacing from header
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 5,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, textAlign: "right" },

  groupsWrap: { paddingHorizontal: 20, paddingBottom: 10 },
  groupBlock: { marginBottom: 12 },
  groupTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 10,
    borderRadius: 16,
    elevation: 5,
  },
  cardIcon: {
    width: 56,
    height: 56,
    backgroundColor: "#0891b2",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  cardDesc: {
    fontSize: 14,
    textAlign: "right",
    lineHeight: 20,
  },

  footer: { padding: 20, alignItems: "center" },
  footerText: { fontSize: 12, textAlign: "center" },
  creditText: { fontSize: 12, marginTop: 5 },
});
