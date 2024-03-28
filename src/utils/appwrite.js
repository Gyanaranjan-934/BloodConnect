import { Account,Client, ID } from "node-appwrite";
import { ApiError } from "./ApiError.js";

class AuthService{
    client = new Client();
    account;
    constructor(){
        this.client
        .setEndpoint("https://cloud.appwrite.io/v1")
        .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
        
        this.account = new Account(this.client);
    }

    async createAccount({email,password,name}){
        try {
            const user = await this.account.create(ID.unique(),email,password,name);
            if(user){
                return user;
            }else{
                throw new ApiError(500,"Something error occured");
            }
        } catch (error) {
            console.log(error);
            throw new ApiError(400,error.message)
        }
    }

    async createSession({email,password}){
        try {
            await this.account.createEmailPasswordSession(email,password);
        } catch (error) {
            console.log(error);
            throw new ApiError(400,error.message)   
        }
    }

    async sendEmailVerification({email}){
        try {
            await this.account.createVerification("http://localhost:8000");
            console.log("email sent");
        } catch (error) {
            console.log(error);
            throw new ApiError(400,error.message)
        }   
    }
}

const authService = new AuthService();

export default authService