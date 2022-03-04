import { Resolver, Mutation, Arg } from "type-graphql";
import { sendEmail } from "../utils/sendEmail";
import { User } from "../../entity/User";
import { v4 } from "uuid";
import { redisClient } from "../../redis";
import { forgotPasswordPrefix } from "../constants/redisPrefixes";

@Resolver()
//we define User here to know which object we resolve from
export class ForgotPasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
      //throw error implemetn
    }
    const token = v4();
    await redisClient.set(
      forgotPasswordPrefix + token,
      user.id,
      "ex",
      60 * 60 * 24
    ); //1day
    const url = `http://localhost:3000/user/change-password/${token}`;

    await sendEmail(email, url);
    return true;
  }
}
