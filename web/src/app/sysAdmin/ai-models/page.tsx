import type { Metadata } from "next";
import { getT } from "@/app/i18n";
import { loadAiModelsPageData } from "@/lib/ai/load-ai-models-page-data.server";
import { ClientAiModels } from "./components/client-ai-models";

export const metadata: Metadata = {
	title: "AI models",
};

export default async function AiModelsPage() {
	const data = await loadAiModelsPageData();
	if (!data) {
		const { t } = await getT();
		return <p>{t("sysadmin_no_access")}</p>;
	}
	return <ClientAiModels data={data} />;
}
