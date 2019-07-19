# VTU Result Notifier
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
> Get an email when new results are released.

### What does this do?

VRN visits the results website of VTU on specified intervals and checks for new results. If it finds any new announcements related to B.Tech/B.E, it will notify via email.

**Note**: Make sure to run this script before any new announcement, because it uses previously made announcements to distinguish new ones.

## Install
Install [nodejs](https://nodejs.org) & then run the below command.
```sh
npm i -g vrn
```

## Usage

Create a `vrn.toml` file somewhere and fill all the required details (See [`example.vrn.toml`](example.vrn.toml)).

And then cd to where `vrn.toml` is present and just run:
```sh
vrn
```

## License

MIT © [Satya Rohith](https://satyarohith.com)
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="http://nithishravindra.com"><img src="https://avatars1.githubusercontent.com/u/36659651?v=4" width="100px;" alt="nithishravindra"/><br /><sub><b>nithishravindra</b></sub></a><br /><a href="#ideas-Nithishravindra" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!