use anchor_lang::{prelude::*, solana_program::pubkey};

declare_id!("9gQfxMKfELeAjLmAoriLpkVPSHd7xb36cBfYXDXX27xE");

#[constant]
pub const EVENT_ORGANIZER: Pubkey = pubkey!("fun8eenPrVMJtiQNE7q1iBVDNuY2Lbnc3x8FFgCt43N");

#[program]
pub mod scavenger_hunt {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.user_state.user = ctx.accounts.user.key();
        ctx.accounts.user_state.last_point = 0;
        Ok(())
    }

    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        ctx.accounts.user_state.last_point =
            ctx.accounts.user_state.last_point.checked_add(1).unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = [user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 8

    )]
    pub user_state: Account<'info, UserState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CheckIn<'info> {
    #[account(
        mut,
        seeds = [user.key().as_ref()],
        bump,
    )]
    pub user_state: Account<'info, UserState>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(address = EVENT_ORGANIZER)]
    pub event_organizer: Signer<'info>,
}

#[account]
pub struct UserState {
    pub user: Pubkey,
    pub last_point: u8,
}
