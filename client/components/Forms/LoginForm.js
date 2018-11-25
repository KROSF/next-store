import React, { Component } from 'react';
import StyledForm from './styles/FormStyles';


class LoginForm extends Component {
  state = {
    name: '',
    password: '',
    email: ''
  };
  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
          <StyledForm
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              this.setState({ name: '', email: '', password: '' });
            }}
          >
            <fieldset disabled={false} aria-busy={false}>
              <h2>Sign into your account</h2>

              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>

              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>

              <button className="big-btn"
                type="submit"
              >Sign In!</button>
            </fieldset>
          </StyledForm>
    );
  }
}

export { LoginForm };