import { FormAdvancedSetting } from '../../utils/typings'
import { FormData, FormField } from 'botpress/sdk'

export interface FormProps {
  axios?: any
  mediaPath?: string
  overrideFields?: {[field: string]: (props: any) => JSX.Element}
  fields: FormField[]
  advancedSettings?: FormAdvancedSetting[]
  formData?: FormData
  getEmptyData?: (renderType?: string) => FormData
  onUpdate: (data: { [key: string]: string }) => void
}
