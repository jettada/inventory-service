import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('ORDER_SERVICE') private orderService: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @MessagePattern('order_created')
  handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    // console.log(`Pattern: ${context.getPattern()}`);
    // console.log(context.getMessage());
    // console.log(context.getChannelRef());
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log('Order received for processing order', data);
    const isInStock = false;
    if (isInStock) {
      console.log('Inventory available. Processing order.');
      channel.ack(originalMsg);
      //completed order
      this.orderService.emit('order_completed', data);
    } else {
      console.log('Inventory Not available. ');
      channel.ack(originalMsg);
      //cancel order
      this.orderService.emit('order_cancel', data);
    }
  }
}
