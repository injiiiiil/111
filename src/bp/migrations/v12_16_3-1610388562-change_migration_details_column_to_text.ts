// Since the table creation did not reflect this migration from 12.16.2 to 12.17.2,
// we had to duplicate it so no version would not be affected.
// See: https://github.com/botpress/botpress/pull/4513
import * as sdk from 'botpress/sdk'
import { Migration } from 'core/services/migration'

const TABLE_NAME = 'srv_migrations'

const migrateSrvMigration = async (bp: typeof sdk, db: sdk.KnexExtended) => {
  if (db.isLite) {
    bp.logger.info('No length constraint on sqlite varchar')
    return
  }
  return db.schema.alterTable(TABLE_NAME, table => table.text('details').alter())
}

const migration: Migration = {
  info: {
    description: `Alter details column of ${TABLE_NAME} from varchar(255) to text`,
    type: 'database'
  },
  up: async ({ bp, database }: sdk.ModuleMigrationOpts): Promise<sdk.MigrationResult> => {
    await migrateSrvMigration(bp, database.knex)
    return { success: true, message: 'Migration details column has been altered successfully' }
  }
}

export default migration
