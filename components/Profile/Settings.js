import { useState, useEffect, useRef } from 'react'
import {
  Form,
  Button,
  Divider,
  Message,
  List,
  Checkbox,
} from 'semantic-ui-react'

function Settings() {
  const [showUpdatePassword, setShowUpdatePassword] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    success && setTimeout(() => setSuccess(false), 3000)
  }, [success])

  return (
    <>
      {success && (
        <>
          <Message icon='check circle' header='Updated successfully' success />
          <Divider hidden />
        </>
      )}
      <List size='huge'>
        <List.Item>
          <List.Icon name='user secret' size='large' verticalAlign='middle' />
          <List.Content>
            <List.Header
              as='a'
              onClick={() => setShowUpdatePassword(!showUpdatePassword)}
              content='Update Password'
            />
          </List.Content>
          {showUpdatePassword && (
            <UpdatePassword
              setSuccess={setSuccess}
              setShowUpdatePassword={setShowUpdatePassword}
            />
          )}
        </List.Item>
      </List>
    </>
  )
}

const UpdatePassword = ({ setSuccess, setShowUpdatePassword }) => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    errorMsg !== null && setTimeout(() => setErrorMsg(null), 5000)
  }, [errorMsg])

  const [userPasswords, setUserPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [showTypedPassword, setShowTypedPassword] = useState({
    field1: false,
    field2: false,
  })

  const { currentPassword, newPassword } = userPasswords
  const { field1, field2 } = showTypedPassword

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserPasswords((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <>
      <Form
        error={errorMsg != null}
        loading={loading}
        onSubmit={(e) => e.preventDefault()}
      >
        <List.List>
          <List.Item>
            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                onClick: () =>
                  setShowTypedPassword((prev) => ({
                    ...prev,
                    field1: !field1,
                  })),
              }}
              type={field1 ? 'text' : 'password'}
              iconPosition='left'
              label='Current Password'
              placeholder='Enter Current Password'
              name='currentPassword'
              onChange={handleChange}
              value={currentPassword}
            />

            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                onClick: () =>
                  setShowTypedPassword((prev) => ({
                    ...prev,
                    field2: !field2,
                  })),
              }}
              type={field2 ? 'text' : 'password'}
              iconPosition='left'
              label='New Password'
              placeholder='Enter New Password'
              name='newPassword'
              onChange={handleChange}
              value={newPassword}
            />

            <Button
              disabled={loading || newPassword === '' || currentPassword === ''}
              compact
              icon='configure'
              type='submit'
              color='teal'
              content='Confirm'
            />
            <Button
              disabled={loading}
              compact
              icon='cancel'
              content='Cancel'
              onClick={() => setShowUpdatePassword(false)}
            />

            <Message error icon='meh' header='Oops' content={errorMsg} />
          </List.Item>
        </List.List>
      </Form>
      <Divider hidden />
    </>
  )
}

export default Settings
