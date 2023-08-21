import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const octokit = github.getOctokit(core.getInput('github_token'))
    const [owner, repo] = core.getInput('repo').split('/')
    const action = core.getInput('action') ?? 'read'
    const name = core.getInput('name')
    const environment = core.getInput('environment')
    const value = core.getInput('value')
    const repository = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo
    })
    if (action === 'read') {
      const readResult = await octokit.request(
        'GET /repositories/{repository_id}/environments/{environment_name}/variables/{name}',
        {
          repository_id: repository.data.id,
          environment_name: environment,
          name
        }
      )
      if (readResult.data.value) {
        core.setOutput('value', readResult.data.value)
      } else {
        core.setFailed('Could not read the variable')
      }
    } else if (action === 'update') {
      const updateResult = await octokit.request(
        'PATCH /repositories/{repository_id}/environments/{environment_name}/variables/{name}',
        {
          repository_id: repository.data.id,
          environment_name: environment,
          name,
          value
        }
      )
      if (updateResult.status === 204) {
        core.setOutput('value', value)
      }
    } else {
      core.setFailed('Action not supported')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()