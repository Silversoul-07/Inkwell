import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { GlobalLorebookList } from "@/components/global/global-lorebook-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function GlobalLorebookPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const entries = await prisma.lorebookEntry.findMany({
    where: {
      project: { userId: session.user.id },
    },
    include: {
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Lorebook Entries</h1>
          <p className="text-muted-foreground">
            World-building information from all your projects
          </p>
        </div>

        <GlobalLorebookList initialEntries={entries} />
      </div>
    </div>
  );
}
