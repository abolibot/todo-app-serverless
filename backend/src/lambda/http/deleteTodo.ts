import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodoItem, todoItemExists } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const validTodoId = await todoItemExists(event, todoId)

    if (!validTodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo item does not exist'
        })
      }
    }
    
    await deleteTodoItem(event, todoId)

    return {
      statusCode: 204,
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Credentials': true
      // },
      body: JSON.stringify({})
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
