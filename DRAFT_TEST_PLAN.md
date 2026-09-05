# PHASE 4 - Save Draft, Auto-save & Resume - Test Plan

## Test Checklist

### Backend Tests

#### 1. Draft Creation & Retrieval
- [ ] GET /api/v1/institute/draft creates new draft if none exists
- [ ] GET /api/v1/institute/draft returns existing draft
- [ ] Owner can only access their own draft
- [ ] Unauthorized access returns 401

#### 2. Save Draft
- [ ] POST /api/v1/institute/draft/save saves step 1 data
- [ ] POST /api/v1/institute/draft/save saves step 2 data
- [ ] POST /api/v1/institute/draft/save saves all 11 steps
- [ ] Saves multiple courses
- [ ] Saves multiple trainers
- [ ] Updates lastSavedAt timestamp
- [ ] Calculates completion percentage
- [ ] Updates current step

#### 3. File Upload
- [ ] POST /api/v1/institute/draft/upload uploads logo
- [ ] POST /api/v1/institute/draft/upload uploads cover image
- [ ] POST /api/v1/institute/draft/upload uploads gallery images
- [ ] POST /api/v1/institute/draft/upload uploads verification docs
- [ ] Returns file URL after upload

#### 4. Draft Submission
- [ ] POST /api/v1/institute/draft/submit validates required fields
- [ ] POST /api/v1/institute/draft/submit changes status to 'submitted'
- [ ] POST /api/v1/institute/draft/submit sets completion to 100%

#### 5. Draft Status
- [ ] GET /api/v1/institute/draft/status returns draft info
- [ ] GET /api/v1/institute/draft/status returns null if no draft

#### 6. Delete Draft
- [ ] DELETE /api/v1/institute/draft removes draft
- [ ] DELETE /api/v1/institute/draft returns 404 if no draft

### Frontend Tests

#### 7. Load Draft on Mount
- [ ] InstituteRegistrationNew loads draft on mount
- [ ] Restores all step data
- [ ] Restores current step number
- [ ] Restores completion percentage
- [ ] Restores last saved timestamp
- [ ] Shows loading state

#### 8. Auto-save Functionality
- [ ] Auto-saves after 30 seconds of changes
- [ ] Shows "Auto-saving..." indicator
- [ ] Shows "Saved" after successful auto-save
- [ ] Clears unsaved changes flag after auto-save
- [ ] Does not auto-save if already saving

#### 9. Manual Save Draft
- [ ] "Save Draft" button saves current step
- [ ] Shows success message
- [ ] Updates last saved timestamp
- [ ] Shows error message on failure
- [ ] Provides retry button on failure

#### 10. Save & Continue
- [ ] Saves current step data
- [ ] Moves to next step
- [ ] Shows saving indicator
- [ ] Shows error if save fails
- [ ] Does not proceed if save fails

#### 11. Browser Refresh Protection
- [ ] Shows warning when leaving with unsaved changes
- [ ] Does not warn if no unsaved changes
- [ ] Does not warn after successful save

#### 12. Data Restoration
- [ ] Step 1: Institute info restored
- [ ] Step 2: Category & subcategories restored
- [ ] Step 3: Location & contact restored
- [ ] Step 4: Multiple courses restored
- [ ] Step 5: Facilities checkboxes restored
- [ ] Step 6: Multiple trainers restored
- [ ] Step 7: Fees structure restored
- [ ] Step 8: Admission details restored
- [ ] Step 9: Career services restored
- [ ] Step 10: Gallery images & social links restored
- [ ] Step 11: Verification documents restored

#### 13. Dashboard Integration
- [ ] Dashboard shows draft status
- [ ] "Continue Editing" navigates to registration
- [ ] Shows current step number
- [ ] Shows completion percentage
- [ ] Shows last saved date/time
- [ ] Shows status badge (draft/submitted/approved/rejected)
- [ ] "Delete Draft" removes draft with confirmation
- [ ] "Start Registration" button if no draft

#### 14. Full Registration Flow
- [ ] Enter institute name in Step 1
- [ ] Add 3 courses in Step 4
- [ ] Add 2 trainers in Step 6
- [ ] Select 10 facilities in Step 5
- [ ] Upload logo and cover image
- [ ] Upload gallery images (5 images)
- [ ] Upload verification documents
- [ ] Click "Save Draft" on Step 7
- [ ] Refresh browser
- [ ] Verify all data is restored
- [ ] Continue to Step 8
- [ ] Log out
- [ ] Log back in
- [ ] Navigate to dashboard
- [ ] Click "Continue Editing"
- [ ] Verify all data is still present
- [ ] Complete all steps
- [ ] Submit for verification

## Manual Test Instructions

### Test 1: Basic Save & Resume
```
1. Login as institute owner
2. Go to Institute Registration
3. Fill Step 1 (Institute Name: "Test Academy")
4. Click "Save & Continue"
5. Fill Step 2 (Select category)
6. Click "Save Draft"
7. Close browser
8. Reopen and login
9. Go to Dashboard
10. Verify draft is shown
11. Click "Continue Editing"
12. Verify Step 2 is current step
13. Verify all Step 1 data is present
14. Verify all Step 2 data is present
```

### Test 2: Auto-save
```
1. Login and go to registration
2. Fill Step 1 partially
3. Wait 30 seconds
4. Verify "Auto-saving..." appears
5. Verify "Saved" appears after save
6. Verify last saved time is updated
7. Refresh browser
8. Verify data is restored
```

### Test 3: Multiple Courses
```
1. Go to Step 4
2. Add Course 1: "Web Development" with details
3. Add Course 2: "Mobile Development" with details
4. Add Course 3: "Data Science" with details
5. Click "Save Draft"
6. Refresh browser
7. Verify all 3 courses are present
8. Verify all course details are correct
```

### Test 4: Multiple Trainers
```
1. Go to Step 6
2. Add Trainer 1 with photo and details
3. Add Trainer 2 with photo and details
4. Click "Save Draft"
5. Refresh browser
6. Verify both trainers are present
7. Verify trainer photos are shown
8. Verify all trainer details are correct
```

### Test 5: File Uploads
```
1. Upload logo in Step 1
2. Upload cover image in Step 1
3. Upload 5 gallery images in Step 10
4. Upload ID proof in Step 11
5. Upload registration doc in Step 11
6. Click "Save Draft"
7. Refresh browser
8. Verify all images are still displayed
9. Verify all documents are still present
```

### Test 6: Error Handling
```
1. Fill Step 1
2. Disconnect internet
3. Click "Save Draft"
4. Verify error message appears
5. Verify "Retry" button appears
6. Reconnect internet
7. Click "Retry"
8. Verify save succeeds
```

### Test 7: Completion Percentage
```
1. Start new registration
2. Verify 0% completion
3. Complete Step 1
4. Verify percentage increases
5. Complete all 11 steps
6. Verify 100% completion
```

### Test 8: Unsaved Changes Warning
```
1. Fill Step 1 data
2. Make changes without saving
3. Attempt to refresh browser
4. Verify warning dialog appears
5. Click "Stay on page"
6. Click "Save Draft"
7. Attempt to refresh again
8. Verify no warning (data saved)
```

## Expected Results

✅ All data persists across page refreshes
✅ All data persists across logout/login
✅ Auto-save works every 30 seconds
✅ Manual save works immediately
✅ Multiple courses persist
✅ Multiple trainers persist
✅ All file uploads persist
✅ Current step is restored
✅ Completion percentage is accurate
✅ Dashboard shows correct status
✅ Continue Editing works correctly
✅ Browser warning on unsaved changes
✅ Error handling with retry works
✅ Owner can only access their own draft
✅ Drafts never appear publicly

## Performance Checks

- [ ] Draft loads in < 2 seconds
- [ ] Auto-save completes in < 1 second
- [ ] Manual save completes in < 1 second
- [ ] File upload completes in < 5 seconds
- [ ] Dashboard loads in < 2 seconds

## Security Checks

- [ ] Unauthorized users get 401
- [ ] Owner A cannot access Owner B's draft
- [ ] Draft routes require authentication
- [ ] File uploads are scoped to owner
- [ ] No draft data in public API responses
