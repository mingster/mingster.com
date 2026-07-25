"use client";

import {
	PasskeysCard,
	ProvidersCard,
	SessionsCard,
	TwoFactorCard,
} from "@daveyplate/better-auth-ui";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useTranslation } from "@/app/i18n/client";
import { Loader } from "@/components/loader";
import Container from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/providers/i18n-provider";
import type { User } from "@/types";
import EditUser from "./edit-user";

export interface iUserTabProps {
	user: User;
}

export const UserClient: React.FC<iUserTabProps> = ({ user }) => {
	const { lng } = useI18n();
	const { t } = useTranslation(lng);

	const searchParams = useSearchParams();
	const initialTab = searchParams.get("tab");
	//console.log('initialTab: ' + initialTab);

	//show account tab by default
	const [activeTab, setActiveTab] = useState(initialTab || "user");
	const [loading, _setLoading] = useState(false);

	const handleTabChange = (value: string) => {
		//update the state
		setActiveTab(value);
		// update the URL query parameter
		//router.push({ query: { tab: value } });
	};

	// if the query parameter changes, update the state
	useEffect(() => {
		if (initialTab) setActiveTab(initialTab);
	}, [initialTab]);
	//console.log('selectedTab: ' + activeTab);

	if (loading) {
		return <Loader />;
	}

	return (
		<Container className="bg-transparent">
			<Tabs
				value={activeTab}
				defaultValue="user"
				onValueChange={handleTabChange}
				className="w-full"
			>
				<TabsList className="grid grid-cols-2">
					<TabsTrigger className="px-5 lg:min-w-40" value="user">
						{t("account_tabs_account")}
					</TabsTrigger>

					<TabsTrigger className="px-5 lg:min-w-40" value="providers">
						{t("account_tabs_providers")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="user">
					<EditUser serverData={user} />
				</TabsContent>

				<TabsContent value="providers">
					<div className="grid grid-cols-3 gap-2">
						<ProvidersCard
							classNames={{
								base: "",
								header: "",
								title: "text-sm",
								description: "text-muted-foreground",
								content: "bg-transparent",
								footer: "",
								button: "",
							}}
						/>
						<PasskeysCard
							classNames={{
								base: "",
								header: "",
								title: "",
								description: "",
							}}
						/>
						<TwoFactorCard
							classNames={{
								base: "",
								header: "",
								title: "",
								description: "",
								content: "bg-transparent",
								footer: "",
								button: "",
							}}
						/>
					</div>
					<SessionsCard
						classNames={{
							base: "",
							header: "",
							title: "text-sm",
							description: "text-muted-foreground",
							content: "bg-transparent",
							footer: "",
							button: "",
						}}
					/>
				</TabsContent>
			</Tabs>
		</Container>
	);
};
