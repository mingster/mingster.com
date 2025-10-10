"use client";

/**
 * Test component to verify mingster.backbone package integration
 *
 * Usage: Import this component in any page to test the backbone package
 *
 * import { TestBackbone } from "@/components/test-backbone"
 * <TestBackbone />
 */

import {
	Button,
	Loader,
	DataTable,
	ThemeToggler,
	cn,
	formatDateTime,
	useTheme,
} from "mingster.backbone";

export function TestBackbone() {
	const { theme } = useTheme();
	const now = new Date();

	// Test data for DataTable
	const columns = [
		{
			accessorKey: "name",
			header: "Name",
		},
		{
			accessorKey: "value",
			header: "Value",
		},
	];

	const data = [
		{ name: "Theme", value: theme || "loading..." },
		{ name: "Current Time", value: formatDateTime(now) },
		{ name: "Package", value: "mingster.backbone" },
	];

	return (
		<div className={cn("space-y-6 p-8")}>
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">mingster.backbone Package Test</h2>
				<p className="text-muted-foreground">
					Testing components, hooks, and utilities from the shared package
				</p>
			</div>

			{/* Test Button */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Button Component</h3>
				<div className="flex gap-2">
					<Button>Default Button</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
				</div>
			</div>

			{/* Test Loader */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Loader Component</h3>
				<Loader />
			</div>

			{/* Test ThemeToggler */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Theme Toggler</h3>
				<ThemeToggler />
			</div>

			{/* Test DataTable */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">DataTable Component</h3>
				<DataTable columns={columns} data={data} noSearch />
			</div>

			{/* Test Utils */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Utility Functions</h3>
				<div className="space-y-1 text-sm">
					<p>
						<strong>cn() utility:</strong>{" "}
						<span className={cn("text-green-600", "font-bold")}>
							Classes merged successfully
						</span>
					</p>
					<p>
						<strong>formatDateTime():</strong> {formatDateTime(now)}
					</p>
				</div>
			</div>

			{/* Test Hooks */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Hooks</h3>
				<div className="space-y-1 text-sm">
					<p>
						<strong>useTheme():</strong> Current theme is{" "}
						<span className="font-mono">{theme || "loading"}</span>
					</p>
				</div>
			</div>

			<div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
				<p className="font-semibold text-green-800 dark:text-green-200">
					✅ All components loaded successfully from mingster.backbone!
				</p>
			</div>
		</div>
	);
}
