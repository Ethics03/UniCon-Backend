import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";


@WebSocketGateway()
export  class ChatGateway {
    @SubscribeMessage("MessageEvent")
    handleNewMessage(@MessageBody() mes: any){
            console.log(mes)
    }
}