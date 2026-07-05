"use client";

import useSWR from "swr";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

type CountryRow = { alpha2: string; alpha3: string; name: string };

const fetcher = (url: RequestInfo) => fetch(url).then((res) => res.json());

interface AvailableCountriesFormFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	disabled?: boolean;
	label?: string;
	description?: string;
}

export function AvailableCountriesFormField<T extends FieldValues>({
	control,
	name,
	disabled = false,
	label = "Available countries",
	description = "Stores only see this method when at least one of their supported countries matches.",
}: AvailableCountriesFormFieldProps<T>) {
	const { data: allCountries = [] } = useSWR<CountryRow[]>(
		`${process.env.NEXT_PUBLIC_API_URL}/common/get-countries`,
		fetcher,
	);

	return (
		<FormField
			control={control}
			name={name}
			render={() => (
				<FormItem className="sm:col-span-2">
					<div className="mb-4">
						<FormLabel className="text-base">
							{label} <span className="text-destructive">*</span>
						</FormLabel>
						<FormDescription className="text-xs font-mono text-gray-500">
							{description}
						</FormDescription>
					</div>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
						{allCountries.map((country) => (
							<FormField
								key={country.alpha2}
								control={control}
								name={name}
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-y-0 space-x-3">
										<FormControl>
											<Checkbox
												className="h-5 w-5 touch-manipulation sm:h-4 sm:w-4"
												checked={field.value?.includes(country.alpha2)}
												disabled={disabled}
												onCheckedChange={(checked) => {
													const next = checked
														? [...(field.value ?? []), country.alpha2]
														: field.value?.filter(
																(value: string) => value !== country.alpha2,
															);
													field.onChange(next ?? []);
												}}
											/>
										</FormControl>
										<FormLabel className="font-normal">
											{country.name} ({country.alpha2})
										</FormLabel>
									</FormItem>
								)}
							/>
						))}
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
