<?php

namespace App\Data;

readonly class TeamPermissions
{
    public function __construct(
        public bool $canUpdateTeam,
        public bool $canDeleteTeam,
        public bool $canAddMember,
        public bool $canUpdateMember,
        public bool $canRemoveMember,
        public bool $canCreateInvitation,
        public bool $canCancelInvitation,
        public bool $canCreateContent = false,
        public bool $canUpdateContent = false,
        public bool $canPublishContent = false,
        public bool $canDeleteContent = false,
        public bool $canManageMedia = false,
    ) {
        //
    }
}
