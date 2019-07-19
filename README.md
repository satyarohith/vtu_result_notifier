# VTU Result Notifier
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