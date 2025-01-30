export enum IdentityProvider {
    Google = 'Google',
    Rippling = 'Rippling',
    OneLogin = 'OneLogin',
    JumpCloud = 'JumpCloud',
    Okta = 'Okta',
    Azure = 'Azure',
    Duo = 'Duo',
    Generic = 'Generic',
}

export enum OrgAuditLogEventType {
    ORG_CREATED = 'OrgCreated',
    ORG_UPDATED = 'OrgUpdated',
    ORG_DELETED = 'OrgDeleted',
    ORG_SAML_SETUP = 'OrgSamlSetup',
    ORG_SAML_WENT_LIVE = 'OrgSamlWentLive',
    ORG_SAML_REMOVED = 'OrgSamlRemoved',
    ORG_NAME_UPDATED = 'OrgNameUpdated',
    ORG_CAN_SETUP_SAML_ENABLED = 'OrgCanSetupSamlEnabled',
    ORG_CAN_SETUP_SAML_DISABLED = 'OrgCanSetupSamlDisabled',
    ORG_DOMAIN_UPDATED = 'OrgDomainUpdated',
    ORG_DOMAIN_UPDATED_V2 = 'OrgDomainUpdatedV2',
    ORG_DOMAIN_AUTO_JOIN_ENABLED = 'OrgDomainAutoJoinEnabled',
    ORG_DOMAIN_AUTO_JOIN_DISABLED = 'OrgDomainAutoJoinDisabled',
    ORG_DOMAIN_RESTRICT_ENABLED = 'OrgDomainRestrictEnabled',
    ORG_DOMAIN_RESTRICT_DISABLED = 'OrgDomainRestrictDisabled',
    ORG_METADATA_UPDATED = 'OrgMetadataUpdated',
    ORG_MAX_USERS_UPDATED = 'OrgMaxUsersUpdated',
    ORG_AUTO_LOGOUT_SECONDS_UPDATED = 'OrgAutoLogutSecondsUpdated',
    ORG_CUSTOM_ROLE_MAPPING_SET = 'OrgCustomRoleMappingSet',
    ORG_REQUIRE_2FA_BY_UPDATED = 'OrgRequire2faByUpdated',
    ORG_SCIM_KEY_CREATED = 'OrgScimKeyCreated',
    ORG_SCIM_KEY_REVOKED = 'OrgScimKeyRevoked',
    ORG_API_KEY_CREATED = 'OrgApiKeyCreated',
    ORG_API_KEY_DELETED = 'OrgApiKeyDeleted',
    ORG_INVITATION_SENT = 'OrgInvitationSent',
    ORG_INVITATION_REVOKED = 'OrgInvitationRevoked',
    ORG_USER_ADDED = 'OrgUserAdded',
    ORG_USER_ROLE_CHANGED = 'OrgUserRoleChanged',
    ORG_USER_REMOVED = 'OrgUserRemoved',
}

export type OrgCreatedEvent = {
    event_type: OrgAuditLogEventType.ORG_CREATED
    event_data: {
        [OrgAuditLogEventType.ORG_CREATED]: {
            name: string
            domain_autojoin: boolean | null
            domain_restrict: boolean | null
            domain: string | null
            max_users: number | null
        }
    }
}

export type OrgUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_UPDATED]: {
            key: string
            value: string | null
        }
    }
}

export type OrgDeletedEvent = {
    event_type: OrgAuditLogEventType.ORG_DELETED
    event_data: {
        [OrgAuditLogEventType.ORG_DELETED]: null
    }
}

export type OrgSamlSetupEvent = {
    event_type: OrgAuditLogEventType.ORG_SAML_SETUP
    event_data: {
        [OrgAuditLogEventType.ORG_SAML_SETUP]: {
            provider: IdentityProvider
        }
    }
}

export type OrgSamlWentLiveEvent = {
    event_type: OrgAuditLogEventType.ORG_SAML_WENT_LIVE
    event_data: {
        [OrgAuditLogEventType.ORG_SAML_WENT_LIVE]: {
            provider?: IdentityProvider | null
        }
    }
}

export type OrgSamlRemovedEvent = {
    event_type: OrgAuditLogEventType.ORG_SAML_REMOVED
    event_data: {
        [OrgAuditLogEventType.ORG_SAML_REMOVED]: {
            provider?: IdentityProvider | null
            is_test?: boolean | null
        }
    }
}

export type OrgNameUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_NAME_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_NAME_UPDATED]: {
            name: string
            old_name: string | null
        }
    }
}

export type OrgCanSetupSamlEnabledEvent = {
    event_type: OrgAuditLogEventType.ORG_CAN_SETUP_SAML_ENABLED
    event_data: {
        [OrgAuditLogEventType.ORG_CAN_SETUP_SAML_ENABLED]: null
    }
}

export type OrgCanSetupSamlDisabledEvent = {
    event_type: OrgAuditLogEventType.ORG_CAN_SETUP_SAML_DISABLED
    event_data: {
        [OrgAuditLogEventType.ORG_CAN_SETUP_SAML_DISABLED]: null
    }
}

export type OrgDomainUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_DOMAIN_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_DOMAIN_UPDATED]: {
            domain: string
        }
    }
}

export type OrgDomainUpdatedV2Event = {
    event_type: OrgAuditLogEventType.ORG_DOMAIN_UPDATED_V2
    event_data: {
        [OrgAuditLogEventType.ORG_DOMAIN_UPDATED_V2]: {
            old_domain: string | null
            new_domain: string | null
        }
    }
}

export type OrgDomainAutoJoinEnabledEvent = {
    event_type: OrgAuditLogEventType.ORG_DOMAIN_AUTO_JOIN_ENABLED
    event_data: {
        [OrgAuditLogEventType.ORG_DOMAIN_AUTO_JOIN_ENABLED]: null
    }
}

export type OrgDomainAutoJoinDisabledEvent = {
    event_type: OrgAuditLogEventType.ORG_DOMAIN_AUTO_JOIN_DISABLED
    event_data: {
        [OrgAuditLogEventType.ORG_DOMAIN_AUTO_JOIN_DISABLED]: null
    }
}

export type OrgDomainRestrictEnabledEvent = {
    event_type: OrgAuditLogEventType.ORG_DOMAIN_RESTRICT_ENABLED
    event_data: {
        [OrgAuditLogEventType.ORG_DOMAIN_RESTRICT_ENABLED]: null
    }
}

export type OrgDomainRestrictDisabledEvent = {
    event_type: OrgAuditLogEventType.ORG_DOMAIN_RESTRICT_DISABLED
    event_data: {
        [OrgAuditLogEventType.ORG_DOMAIN_RESTRICT_DISABLED]: null
    }
}

export type OrgMetadataUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_METADATA_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_METADATA_UPDATED]: {
            metadata: string
        }
    }
}

export type OrgMaxUsersUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_MAX_USERS_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_MAX_USERS_UPDATED]: {
            max_users: number | null
        }
    }
}

export type OrgAutoLogoutSecondsUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_AUTO_LOGOUT_SECONDS_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_AUTO_LOGOUT_SECONDS_UPDATED]: {
            user_autologout_seconds: number | null
        }
    }
}

export type OrgCustomRoleMappingSetEvent = {
    event_type: OrgAuditLogEventType.ORG_CUSTOM_ROLE_MAPPING_SET
    event_data: {
        [OrgAuditLogEventType.ORG_CUSTOM_ROLE_MAPPING_SET]: {
            custom_role_mapping_id: string | null
            custom_role_mapping_name?: string | null
        }
    }
}

export type OrgRequire2faByUpdatedEvent = {
    event_type: OrgAuditLogEventType.ORG_REQUIRE_2FA_BY_UPDATED
    event_data: {
        [OrgAuditLogEventType.ORG_REQUIRE_2FA_BY_UPDATED]: {
            require_2fa_by: string | null
        }
    }
}

export type OrgScimKeyCreatedEvent = {
    event_type: OrgAuditLogEventType.ORG_SCIM_KEY_CREATED
    event_data: {
        [OrgAuditLogEventType.ORG_SCIM_KEY_CREATED]: null
    }
}

export type OrgScimKeyRevokedEvent = {
    event_type: OrgAuditLogEventType.ORG_SCIM_KEY_REVOKED
    event_data: {
        [OrgAuditLogEventType.ORG_SCIM_KEY_REVOKED]: null
    }
}

export type OrgApiKeyCreatedEvent = {
    event_type: OrgAuditLogEventType.ORG_API_KEY_CREATED
    event_data: {
        [OrgAuditLogEventType.ORG_API_KEY_CREATED]: null
    }
}

export type OrgApiKeyDeletedEvent = {
    event_type: OrgAuditLogEventType.ORG_API_KEY_DELETED
    event_data: {
        [OrgAuditLogEventType.ORG_API_KEY_DELETED]: {
            api_key_id: string
        }
    }
}

export type OrgInvitationSentEvent = {
    event_type: OrgAuditLogEventType.ORG_INVITATION_SENT
    event_data: {
        [OrgAuditLogEventType.ORG_INVITATION_SENT]: {
            invitee_email: string
            invitee_role: string
            invitee_additional_roles: string[]
        }
    }
}

export type OrgInvitationRevokedEvent = {
    event_type: OrgAuditLogEventType.ORG_INVITATION_REVOKED
    event_data: {
        [OrgAuditLogEventType.ORG_INVITATION_REVOKED]: {
            invitee_email: string
        }
    }
}

export type OrgUserAddedEvent = {
    event_type: OrgAuditLogEventType.ORG_USER_ADDED
    event_data: {
        [OrgAuditLogEventType.ORG_USER_ADDED]: {
            user_id: string
            role: string
            additional_roles: string[]
        }
    }
}

export type OrgUserRoleChangedEvent = {
    event_type: OrgAuditLogEventType.ORG_USER_ROLE_CHANGED
    event_data: {
        [OrgAuditLogEventType.ORG_USER_ROLE_CHANGED]: {
            user_id: string
            old_roles: {
                role: string
                additional_roles: string[]
            }
            new_roles: {
                role: string
                additional_roles: string[]
            }
        }
    }
}

export type OrgUserRemovedEvent = {
    event_type: OrgAuditLogEventType.ORG_USER_REMOVED
    event_data: {
        [OrgAuditLogEventType.ORG_USER_REMOVED]: {
            user_id: string
            user_email_at_removal: string | null
            removed_by_user_id: string | null
            role: string
            additional_roles: string[]
        }
    }
}

export type OrgAuditLogEvent =
    | OrgCreatedEvent
    | OrgUpdatedEvent
    | OrgDeletedEvent
    | OrgSamlSetupEvent
    | OrgSamlWentLiveEvent
    | OrgSamlRemovedEvent
    | OrgNameUpdatedEvent
    | OrgCanSetupSamlEnabledEvent
    | OrgCanSetupSamlDisabledEvent
    | OrgDomainUpdatedEvent
    | OrgDomainUpdatedV2Event
    | OrgDomainAutoJoinEnabledEvent
    | OrgDomainAutoJoinDisabledEvent
    | OrgDomainRestrictEnabledEvent
    | OrgDomainRestrictDisabledEvent
    | OrgMetadataUpdatedEvent
    | OrgMaxUsersUpdatedEvent
    | OrgAutoLogoutSecondsUpdatedEvent
    | OrgCustomRoleMappingSetEvent
    | OrgRequire2faByUpdatedEvent
    | OrgScimKeyCreatedEvent
    | OrgScimKeyRevokedEvent
    | OrgApiKeyCreatedEvent
    | OrgApiKeyDeletedEvent
    | OrgInvitationSentEvent
    | OrgInvitationRevokedEvent
    | OrgUserAddedEvent
    | OrgUserRoleChangedEvent
    | OrgUserRemovedEvent
