import SecurityDashboard from "@/components/security/SecurityDashboard";
export const metadata = {
  title: "Security console",
  robots: { index: false, follow: false },
};
export default function SecurityPage() {
  return <SecurityDashboard />;
}
