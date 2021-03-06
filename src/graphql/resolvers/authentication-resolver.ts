import {Arg, Query, Resolver} from "type-graphql";
import {getAccessToken, getAuthenticationRedirectUrl} from "../../services/authentication-service";

@Resolver()
export class AuthenticationResolver {
    @Query(returns => String)
    async getAccessToken(@Arg("code", {nullable: false}) code: String): Promise<String> {
        return getAccessToken(code);
    };

    @Query(returns => String)
    authenticationRedirectUrl(): String {
        return getAuthenticationRedirectUrl();
    };
}
