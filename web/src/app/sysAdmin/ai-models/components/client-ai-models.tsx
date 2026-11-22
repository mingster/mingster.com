"use client";

import { useState } from "react";
import { updateAiModelAssignmentAction } from "@/actions/sysAdmin/update-ai-model-assignment";
import { useTranslation } from "@/app/i18n/client";
import { toastError, toastSuccess } from "@/components/toaster";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AiModelsPageData } from "@/lib/ai/load-ai-models-page-data.server";

const NONE = "__none__";

export function ClientAiModels({ data }: { data: AiModelsPageData }) {
	const { t } = useTranslation();
	const [model, setModel] = useState(data.model);
	const [fallback, setFallback] = useState<string | null>(data.fallback);
	const [saved, setSaved] = useState({
		model: data.model,
		fallback: data.fallback,
	});
	const [misconfigured, setMisconfigured] = useState(data.misconfigured);
	const [loading, setLoading] = useState(false);

	const providerOf = (id: string | null) =>
		data.catalog.find((entry) => entry.id === id)?.provider;
	const usable = data.catalog.filter(
		(e) => data.providerConfigured[e.provider],
	);
	// Keep the current id selectable when it is stale, so the Select never shows a blank.
	const modelOptions = [
		...usable,
		...(usable.some((e) => e.id === model)
			? []
			: [{ id: model, label: model, provider: undefined }]),
	];
	const fallbackOptions = usable.filter(
		(e) => e.provider !== providerOf(model),
	);
	if (fallback && !fallbackOptions.some((e) => e.id === fallback)) {
		fallbackOptions.push({
			id: fallback,
			label: fallback,
			provider: providerOf(fallback) ?? ("gemini" as const),
		});
	}

	const dirty = model !== saved.model || fallback !== saved.fallback;

	async function onSave() {
		setLoading(true);
		const result = await updateAiModelAssignmentAction({
			purpose: "avatar_chat",
			model,
			fallback,
		});
		if (result?.serverError || result?.validationErrors || !result?.data) {
			toastError({
				description: result?.serverError ?? t("sysadmin_ai_save_failed"),
			});
		} else {
			setSaved(result.data);
			setMisconfigured(false);
			toastSuccess({ description: t("saved") });
		}
		setLoading(false);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold">{t("sysadmin_ai_models_title")}</h1>
			<p className="text-sm text-muted-foreground">
				{t("sysadmin_ai_models_descr")}
			</p>
			<h2 className="font-medium">{t("sysadmin_ai_purpose_avatar_chat")}</h2>
			{misconfigured && (
				<p role="alert" className="text-sm text-destructive">
					{t("sysadmin_ai_purpose_misconfigured")}
				</p>
			)}
			<div className="space-y-1">
				<label htmlFor="ai-model" className="text-sm">
					{t("sysadmin_ai_model_label")}
				</label>
				<Select value={model} onValueChange={setModel} disabled={loading}>
					<SelectTrigger id="ai-model">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{modelOptions.map((e) => (
							<SelectItem key={e.id} value={e.id}>
								{e.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1">
				<label htmlFor="ai-fallback" className="text-sm">
					{t("sysadmin_ai_fallback_label")}
				</label>
				<Select
					value={fallback ?? NONE}
					onValueChange={(v) => setFallback(v === NONE ? null : v)}
					disabled={loading}
				>
					<SelectTrigger id="ai-fallback">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NONE}>
							{t("sysadmin_ai_fallback_none")}
						</SelectItem>
						{fallbackOptions.map((e) => (
							<SelectItem key={e.id} value={e.id}>
								{e.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<Button onClick={onSave} disabled={loading || !dirty}>
				{t("save")}
			</Button>
		</div>
	);
}
