"use server";

import { pstvDBPrismaClient } from "@/lib/prisma-client-pstv";
import type { SupportTicket } from "@/types";
import { TicketPriority } from "@/types/enum";
import { userRequiredActionClient } from "@/utils/actions/safe-action";
import { getUtcNow } from "@/utils/datetime-utils";
import { transformBigIntToNumbers } from "@/utils/utils";
import { updateTicketSchema } from "./update-ticket.validation";

export const updateTicketAction = userRequiredActionClient
	.metadata({ name: "updateTicket" })
	.schema(updateTicketSchema)
	.action(
		async ({
			parsedInput: {
				id,
				threadId,
				customer_id,
				domain_id,
				//priority,
				department,
				subject,
				message,
				status,
				creator,
				modifier,
			},
		}) => {
			const priority = TicketPriority.Medium;
			//if there's no id, this is a new object
			//
			if (id === undefined || id === null || id <= 0) {
				const result = await pstvDBPrismaClient.supportTicket.create({
					data: {
						threadId,
						customer_id,
						domain_id,
						priority,
						department,
						subject,
						message,
						status,
						creator,
						creationDate: getUtcNow(),
						modifier,
						lastModified: getUtcNow(),
					},
				});
				id = result.id as unknown as number;

				if (threadId) {
					//update status for all tickets in the thread
					await pstvDBPrismaClient.supportTicket.updateMany({
						where: { threadId },
						data: { status },
					});
					// update the main ticket status
					await pstvDBPrismaClient.supportTicket.update({
						where: { id: threadId },
						data: { status },
					});
				}
			} else {
				await pstvDBPrismaClient.supportTicket.update({
					where: { id },
					data: {
						//threadId,
						customer_id,
						domain_id,
						priority,
						department,
						subject,
						message,
						status,
						modifier,
						lastModified: getUtcNow(),
					},
				});
			}

			// return main ticket including thread if thread id is available
			// otherwise return the main ticket only
			const whereClause = threadId ? { id: threadId } : { id };

			const result = (await pstvDBPrismaClient.supportTicket.findFirst({
				where: whereClause,
				include: {
					Thread: true,
				},
			})) as SupportTicket;

			transformBigIntToNumbers(result);

			//logger.info("updateTicketAction", { result });

			return result;
		},
	);
