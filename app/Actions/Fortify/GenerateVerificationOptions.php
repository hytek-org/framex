<?php

namespace App\Actions\Fortify;

use Laravel\Passkeys\Actions\GenerateVerificationOptions as BaseGenerateVerificationOptions;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Passkeys;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\PublicKeyCredentialRequestOptions;

class GenerateVerificationOptions extends BaseGenerateVerificationOptions
{
    /**
     * Generate verification options for passwordless login or user confirmation.
     *
     * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialrequestoptions
     */
    public function __invoke(?PasskeyUser $user = null): PublicKeyCredentialRequestOptions
    {
        // When verifying a passkey for an authenticated user (confirm password),
        // we use preferred instead of required to avoid strict failure when
        // the UV flag is false on certain authenticators or environments.
        $userVerification = $user
            ? AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_PREFERRED
            : AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_REQUIRED;

        return PublicKeyCredentialRequestOptions::create(
            challenge: random_bytes(32),
            rpId: Passkeys::relyingPartyId(),
            allowCredentials: $this->allowCredentials($user),
            userVerification: $userVerification,
            timeout: Passkeys::timeout(),
        );
    }
}
