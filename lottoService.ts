import { signIn } from "./signin";

interface LottoServiceInterface {
    signIn(id:string, password:string): Promise<void>;
    purchase(count:number): Promise<number[][]>;
    check(numbers:number[]): Promise<void>;
  }

export class LottoService implements LottoServiceInterface{

    async signIn(id: string, password: string): Promise<void> {
        return await signIn(id,password);
    }

    async purchase(count:number): Promise<number[][]> {
        return await [[1,2,3,4,5,6]]
    }

    async check(numbers:number[]): Promise<void> {
        return await console.log('')
    }

    
}

