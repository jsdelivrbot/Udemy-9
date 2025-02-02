import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import AuthForm from './AuthForm';
import { signInUser } from '../../actions';
import { signInFormValidation as validate } from './validate';

const SignIn = (props) => {
  const {
    errorMessage,
    signInUser: handleSignInUser,
    handleSubmit,
    pristine,
    dirty,
   } = props;
  return (
    <AuthForm
      type="signIn"
      dirty={dirty}
      pristine={pristine}
      errorMessage={errorMessage}
      onSubmit={handleSubmit(handleSignInUser)}
      submitButtonText="Sign in"
    />
  );
}

const mapDispatchToProps = {
  signInUser,
};

const mapStateToProps = ({ auth: { error }}) => ({
  errorMessage: error,
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'signin',
  validate,
})(SignIn));
