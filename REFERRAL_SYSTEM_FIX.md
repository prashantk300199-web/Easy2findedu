# Referral System - Complete Fix Plan

## Issues in Current Implementation
1. No `referralRewardsGiven` flag - rewards can be given multiple times
2. Google auth processes rewards immediately but doesn't track it
3. Regular signup processes rewards in verifyOtp which can be called multiple times
4. No unified reward processing logic

## New Architecture

### Database Changes
Add to Student/User/InstituteOwner models:
- `referralRewardsGiven: Boolean` - Track if user already received signup rewards
- Keep existing `referralCode`, `referredBy`, `wallet` fields

### Flow Rules
1. **First Google Login (New User)**:
   - Create account with status='verified'
   - Check if referral code provided & valid
   - If valid: Give 1000 coins to new user, 500 to referrer
   - If no code: Give 500 coins to new user
   - Generate unique referralCode for new user
   - Set `referralRewardsGiven = true`

2. **Subsequent Google Login (Existing User)**:
   - Just return existing user data
   - No coins given (check `referralRewardsGiven`)

3. **Regular Signup**:
   - Create account with status='pending'
   - Store referralCode in `referredBy` field
   - DON'T give coins yet

4. **OTP Verification**:
   - Check if `referralRewardsGiven === false`
   - If false: Process rewards (1000 with valid code, 500 without)
   - Generate unique referralCode
   - Set `referralRewardsGiven = true`
   - Set status='verified'

5. **Admin Coin Management**:
   - Already exists - admin can edit any student's coins

## Implementation Steps
1. Update all three models (Students, User, InstituteOwner)
2. Fix google.auth.controller.js
3. Fix Student.auth.service.js
4. Add migration script (optional - sets referralRewardsGiven=true for existing users)
