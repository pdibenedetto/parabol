import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  templateLimit: ({templateLimit}) => !!templateLimit,
  aiSummary: ({aiSummary}) => !!aiSummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  checkoutFlow: ({checkoutFlow}) => !!checkoutFlow,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise
}

export default UserFeatureFlags
