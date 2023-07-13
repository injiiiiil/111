import type { IntegrationProps } from '.botpress'
import * as notion from '../notion'

/**
 * @returns the response along with a structure - refer to the [getDbStructure](../notion/notion.ts) function for more details
 */
export const getDb: IntegrationProps['actions']['getDb'] = async ({ ctx, input }) => {
    const defaultResponse = { properties: {}, object: 'database', structure: '' }
    try {
        const response = await notion.getDb(ctx, input.databaseId)
        if (response) {
            console.info(`Successfully fetched the database - "${(response as any)?.title?.[0]?.plain_text || 'Title not found'}"`)
            return { ...response, structure: notion.getDbStructure(response) }
        } else {
            return defaultResponse
        }
    } catch (error) {
        return defaultResponse
    }
}