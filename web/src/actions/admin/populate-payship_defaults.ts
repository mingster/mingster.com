"use server";

import { promises as fs } from "fs";
import { sqlClient } from "@/lib/prismadb";

// create default locales
//
export async function create_locales() {
	const locale_Path = `${process.cwd()}/public/install/locales.json`;

	const file = await fs.readFile(locale_Path, "utf8");
	const data = JSON.parse(file);
	for (let i = 0; i < data.length; i++) {
		const c = data[i];
		//try {

		/*
    const currency = await sqlClient.currency.findUnique({
      where: { id: c.currency },
    });

    if (!currency) {
        console.error(`Currency with id ${c.currency} not found`);
        continue;
      }
    */

		const locale = await sqlClient.locale.create({
			data: {
				...c,
				/*
        id: c.id,
        name: c.name,
        lng: c.lng,
        defaultCurrencyId: c.id,
        */
			},
		});
		console.log(`locale created: ${JSON.stringify(locale)}`);
		/*} catch (err) {
      console.error(err);
    }*/
	}
}


export async function wipeoutDefaultData() {
	await sqlClient.locale.deleteMany();
	await sqlClient.currency.deleteMany();
	await sqlClient.country.deleteMany();
}
