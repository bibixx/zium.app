# Welcome to zium.app contributing guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on [zium.app](https://zium.app) :sparkles:.

Read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](README.md). Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

### Issues

#### Create a new issue

If you spot a problem, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/bibixx/zium.app/issues/new/choose).

#### Solve an issue

Scan through our [existing issues](https://github.com/bibixx/zium.app/issues) to find one that interests you. You can narrow down the search using `labels` as filters. As a general rule, we try not to assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### Design changes

If you found an issue with a `design` label, or would like to propose a change but have no coding skills:
1. Head over to Figma Community to duplicate [the official Zium.app Figma file](https://www.figma.com/community/file/1250905585551204036) into your Drafts.
2. In the file, create a new page called `Contribution (#ISSUE_NUMBER)` where `#ISSUE_NUMBER` is replaced with a number of your GitHub issue. Put the page at the top of the document, so that it's easy to find.
3. Put all of your design changes and/or any new designs on the above-mentioned page exclusively.
4. When happy with your designs paste a link to your Figma file in your GitHub issue and apply a `pending design review` label on your issue.
    - When sharing a link to your Figma file, make sure to set its visibility to `Anyone with a link`.
5. If your designs are approved, a core design contributor will merge them with the official Figma file and mark your GitHub issue as ready to be picked up for implementation.

### Make changes

1. Fork the repository.
- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Install or update to **Node.js**, at the version specified in [the development guide](DEVELOPMENT.md). For more information consult the mentioned guide.

3. Create a working branch and start with your changes!

### Commit your update

Commit the changes once you are happy with them. Don't forget to self-review to speed up the review process :zap:.

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.
- Fill the "Ready for review" template so that we can review your PR. This template helps reviewers understand your changes as well as the purpose of your pull request.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
Once you submit your PR, a team member will review your proposal. We may ask questions or request additional information.
- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations :tada::tada: The zium.app team thanks you :sparkles:.

Once your PR is merged, your contributions will be publicly visible on the [zium.app](https://zium.app).
