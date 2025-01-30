import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth/next";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        userId: { label: "UserId", type: "text", placeholder: "userid" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: credentials?.userId,
            password: credentials?.password,
          }),
        });

        const user = await res.json();

        if (user.message == "Invalid credentials") {
          // Any object returned will be saved in `user` property of the JWT
          return null;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return user;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, trigger, session, user }) {
      if (user) {
        // token.s_image = user.s_image; // Initial login
      }
      // console.log("trigger: ", trigger);
      if (trigger === "update") {
        // console.log('session update: ', session)
        token.s_image = session.user.s_image; // Update profile image
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      // console.log("Token: ", token);  
      session.user = token;
      // session.user.s_image = token.s_image; 
      // console.log('session: ', session.user)
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET, // Use this instead of signingKey
});

export { handler as GET, handler as POST };
