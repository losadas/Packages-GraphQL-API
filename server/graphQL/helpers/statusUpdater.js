const cron = require('node-cron')
const Package = require('../../models/package')

const statusUpdater = () => {
  // Update package status to completed every hour
  cron.schedule('0 * * * *', async () => {
    const packagesToComplete = await Package.find({
      status: 'Saved',
      createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).exec()

    if (packagesToComplete.length > 0) {
      const updatePromises = packagesToComplete.map((package) => {
        package.status = 'Completed'
        return package.save()
      })
      await Promise.all(updatePromises)
      console.log(
        `Updated ${updatePromises.length} packages to completed status.`
      )
    } else {
      console.log('No packages to update.')
    }
  })
}

module.exports = statusUpdater
