/** @type {import(".").OAuthProvider} */
export default function Foursquare(options) {
  const { apiVersion = "20230131" } = options
  return {
    id: "foursquare",
    name: "Foursquare",
    type: "oauth",
    authorization: "https://foursquare.com/oauth2/authenticate",
    token: "https://foursquare.com/oauth2/access_token",
    userinfo: {
      url: `https://api.foursquare.com/v2/users/self?v=${apiVersion}`,
      request({ tokens, provider }) {
        const url = new URL(provider.userinfo.url)
        url.searchParams.append("oauth_token", tokens.access_token)
        return fetch(url).then((res) => res.json())
      },
    },
    profile({ response: { user: profile } }) {
      return {
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.contact.email,
        image: profile.photo
          ? `${profile.photo.prefix}original${profile.photo.suffix}`
          : null,
      }
    },
    style: {
      logo: "/foursquare.svg",
      logoDark: "/foursquare-dark.svg",
      bg: "#fff",
      text: "#000",
      bgDark: "#000",
      textDark: "#fff",
    },
    options,
  }
}
