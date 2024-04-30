import axios, { Axios, AxiosError } from 'axios'
import { isNode } from 'browser-or-node'
import http from 'http'
import https from 'https'
import { Readable } from 'stream'
import { getClientConfig, ClientProps, ClientConfig } from './config'
import { CreateFileBody, CreateFileResponse, GetFileResponse } from './gen'
import { ApiClient as AutoGeneratedClient } from './gen/client'
import { errorFrom } from './gen/errors'

export { isApiError } from './gen/errors'

export * as axios from 'axios'
export type {
  Message,
  Conversation,
  User,
  State,
  Event,
  ModelFile as File,
  Bot,
  Integration,
  Issue,
  IssueEvent,
  Account,
  Workspace,
  Usage,
} from './gen'
export * from './gen/errors'

const _100mb = 100 * 1024 * 1024
const maxBodyLength = _100mb
const maxContentLength = _100mb

type CreateFileProps = {
  /**
   * The name of the file.
   */
  name: string
  /**
   * The data to be uploaded.
   */
  data: Blob | Buffer | Readable
  /**
   * Set to a value of "true" to index the file in vector storage. Only PDFs, Office documents, and text-based files are currently supported. Note that if a file is indexed, it will count towards the Vector Storage quota of the workspace rather than the File Storage quota.
   * @default false
   */
  index?: boolean
  /**
   * Tags to associate with the file.
   */
  tags?: { [key: string]: string }
  /**
   * File content type. If omitted, the content type will be inferred from the file extension. If a type cannot be inferred, the default is "application/octet-stream".
   */
  contentType?: string
  contentLength?: number
  /**
   * File access policies. Add "public_content" to allow public access to the file content. Add "integrations" to allo read, search and list operations for any integration installed in the bot.
   */
  accessPolicies?: ('integrations' | 'public_content')[]
}

export class Client extends AutoGeneratedClient {
  public readonly config: Readonly<ClientConfig>
  private readonly axiosClient: Axios

  public constructor(clientProps: ClientProps = {}) {
    const clientConfig = getClientConfig(clientProps)
    const axiosClient = createAxiosClient(clientConfig)

    super(undefined, clientConfig.apiUrl, axiosClient)

    this.axiosClient = axiosClient
    this.config = clientConfig
  }

  /**
   * Creates and uploads a new file in a single step. Returns an object containing the file metadata and the URL to retrieve the file.
   */
  public createAndUploadFile = async ({
    name,
    data,
    index,
    tags,
    contentType,
    contentLength,
    accessPolicies,
  }: CreateFileProps): Promise<GetFileResponse> => {
    const headers = {
      ...this.config.headers,
      'content-length': contentLength,
    }

    const requestBody: CreateFileBody = {
      name,
      tags,
      index,
      accessPolicies,
      contentType,
    }

    const response = await this.axiosClient
      .post('/v1/files', requestBody, { headers, baseURL: this.config.apiUrl })
      .catch((e) => {
        throw getError(e)
      })

    const { file } = response.data as CreateFileResponse

    try {
      await axios.put(file.uploadUrl, data, {
        maxBodyLength: Infinity,
      })
    } catch (err: any) {
      throw new FileUploadError(`Failed to upload file: ${err.message}`, <AxiosError>err, file)
    }

    // Calling this endpoint triggers the processing of the upload on the API side and allows to return the retrieval URL and the file with the correct status.
    return await this.getFile({ id: file.id })
  }
}

export class FileUploadError extends Error {
  public constructor(
    message: string,
    public readonly error: AxiosError,
    public readonly file: CreateFileResponse['file']
  ) {
    super(message)
    this.name = 'FileUploadError'
  }
}

function createAxiosClient(config: ClientConfig) {
  const { headers, withCredentials, timeout } = config
  return axios.create({
    headers,
    withCredentials,
    timeout,
    maxBodyLength,
    maxContentLength,
    httpAgent: isNode ? new http.Agent({ keepAlive: true }) : undefined,
    httpsAgent: isNode ? new https.Agent({ keepAlive: true }) : undefined,
  })
}

function getError(err: Error) {
  if (axios.isAxiosError(err) && err.response?.data) {
    return errorFrom(err.response.data)
  }
  return errorFrom(err)
}

type Simplify<T> = { [KeyType in keyof T]: Simplify<T[KeyType]> } & {}

type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type ExtractMethods<T> = PickMatching<T, (...rest: any[]) => any>

type FunctionNames = keyof ExtractMethods<Client>

export type ClientParams<T extends FunctionNames> = Simplify<Parameters<Client[T]>[0]>
export type ClientReturn<T extends FunctionNames> = Simplify<Awaited<ReturnType<Client[T]>>>
