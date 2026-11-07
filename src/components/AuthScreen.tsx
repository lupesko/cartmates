interface Props {
  readonly denied: boolean;
}

export function AuthScreen({ denied }: Props) {
  return (
    <main className="auth-screen">
      <div className="auth-screen__brand">
        <img className="auth-screen__mascot" src="/assets/illustrations/cart-mascot.svg" alt="A smiling shopping cart filled with groceries" />
        <img className="auth-screen__logo" src="/assets/brand/cartmates-logo.svg" alt="CartMates" />
        <p>A shared grocery list for<br />your household, flat, or team</p>
      </div>
      {denied && <div className="auth-screen__denied" role="alert"><strong>That account isn’t on this list yet.</strong><span>Ask your CartMates administrator to add your Google email.</span></div>}
      <a className="google-button" href="/api/auth/login">
        <img src="/assets/icons/google-g.svg" alt="" aria-hidden="true" />
        Continue with Google
      </a>
      <img className="auth-screen__footer" src="/assets/illustrations/grocery-footer.svg" alt="" aria-hidden="true" />
    </main>
  );
}
