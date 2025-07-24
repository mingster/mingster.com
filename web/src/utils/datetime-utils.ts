import { format } from "date-fns";

// https://nextjs.org/learn-pages-router/basics/dynamic-routes/polishing-post-page
// https://github.com/you-dont-need/You-Dont-Need-Momentjs?tab=readme-ov-file#string--time-format
export const formatDateTime = (d: Date | undefined) => {
	if (d === undefined) return "";

	return format(d, "yyyy-MM-dd HH:mm");
};
export const formatDateTimeFull = (d: Date | undefined) => {
	if (d === undefined) return "";

	return format(d, "yyyy-MM-dd HH:mm zzz");
};

export function getNowTimeInTz(offsetHours: number) {
	//throw error if offsetHours is not a number
	if (typeof offsetHours !== "number") {
		throw new Error("offsetHours must be a number");
	}

	return getDateInTz(getUtcNow(), offsetHours);
}

export function getDateInTz(dt: Date, offsetHours: number): Date {
	//throw error if offsetHours is not a number
	if (typeof offsetHours !== "number") {
		throw new Error("offsetHours must be a number");
	}

	// if dt is not Date object, return empty string
	if (typeof dt !== "object") return dt;

	const result = new Date(
		Date.UTC(
			dt.getFullYear(),
			dt.getMonth(),
			dt.getDate(),
			dt.getHours(),
			dt.getMinutes(),
			dt.getSeconds(),
			offsetHours * 60,
		),
	);

	//console.log('dt', dt, result);

	return result;
}

export function getOffsetHours(timezone: string): number {
	try {
		const date = new Date();
		const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
		const tzDate = new Date(
			date.toLocaleString("en-US", { timeZone: timezone }),
		);
		const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
		return offsetMinutes / 60;
	} catch (error) {
		console.error("Invalid timezone:", timezone, error);
		return 0; // Return UTC offset as fallback
	}
}

export function getUtcNow() {
	const d = new Date();
	const utcDate = new Date(
		d.getUTCFullYear(),
		d.getUTCMonth(),
		d.getUTCDate(),
		d.getUTCHours(),
		d.getUTCMinutes(),
		d.getUTCSeconds(),
		d.getUTCMilliseconds(),
	);

	//console.log('utcDate', utcDate);
	return utcDate;
}

export const calculateTrialEndUnixTimestamp = (
	trialPeriodDays: number | null | undefined,
) => {
	// Check if trialPeriodDays is null, undefined, or less than 2 days
	if (
		trialPeriodDays === null ||
		trialPeriodDays === undefined ||
		trialPeriodDays < 2
	) {
		return undefined;
	}

	const currentDate = new Date(); // Current date and time
	const trialEnd = new Date(
		currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000,
	); // Add trial days

	return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

export const toDateTime = (secs: number) => {
	const t = new Date(+0); // Unix epoch start.
	t.setSeconds(secs);

	return t;
};

/**
 * Returns the number of days from the given datetime.
 *
 * @param dt - The input Date object
 * @returns The number of days in the month of the given datetime
 */
export function getNumOfDaysInTheMonth(dt: Date): number {
	const day = dt.getDate();
	let yr = dt.getFullYear();
	let mo = dt.getMonth() + 1; // JS months are 0-based, so +1 for 1-based

	const eom = new Date(yr, mo, 0).getDate(); // last day of this month

	if (day === eom) {
		mo = mo + 1;
		if (mo > 12) {
			mo = 1;
			yr = yr + 1;
		}
	}

	// JS Date: new Date(year, month, 0) gives last day of previous month, so month is 1-based here
	return new Date(yr, mo, 0).getDate();
}
