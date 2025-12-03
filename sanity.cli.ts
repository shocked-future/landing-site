import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = 'production'

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset,
  },
})