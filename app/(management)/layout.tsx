import { ManagementLayout } from "@/shared/components/layout/management-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ManagementLayout>{children}</ManagementLayout>;
}
