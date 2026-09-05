import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Users, AlertCircle } from 'lucide-react';

/**
 * Step 5: Batches & Schedule
 *
 * Allows institute owners to add, edit, and manage batches.
 * Batches can be linked to courses from Step 4.
 */
const Step5Batches = ({ data, coursesData, onChange, onNext, onPrev }) => {
  const [batches, setBatches] = useState(data?.batches || []);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    batchName: '',
    courseId: '',
    courseName: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    classTiming: '',
    classDuration: '',
    classesPerWeek: '',
    batchSize: '',
    seatsAvailable: '',
    scheduleType: '',
    timeSlot: '',
    mode: '',
    trialAvailable: false,
    status: 'Upcoming'
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const scheduleTypes = ['Weekday', 'Weekend', 'Weekday & Weekend'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const modes = ['Online', 'Offline', 'Hybrid'];
  const statuses = ['Upcoming', 'Ongoing', 'Full', 'Closed'];

  const courses = coursesData?.courses || [];

  const handleAddBatch = () => {
    setFormData({
      id: Date.now().toString(),
      batchName: '',
      courseId: '',
      courseName: '',
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      classTiming: '',
      classDuration: '',
      classesPerWeek: '',
      batchSize: '',
      seatsAvailable: '',
      scheduleType: '',
      timeSlot: '',
      mode: '',
      trialAvailable: false,
      status: 'Upcoming'
    });
    setEditingIndex(null);
    setShowForm(true);
    setError('');
  };

  const handleEditBatch = (index) => {
    setFormData(batches[index]);
    setEditingIndex(index);
    setShowForm(true);
    setError('');
  };

  const handleDeleteBatch = (index) => {
    const newBatches = batches.filter((_, i) => i !== index);
    setBatches(newBatches);
  };

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setFormData({
      ...formData,
      courseId,
      courseName: course ? course.courseName : ''
    });
  };

  const handleDayToggle = (day) => {
    const newDays = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter(d => d !== day)
      : [...formData.daysOfWeek, day];

    setFormData({ ...formData, daysOfWeek: newDays });
  };

  const validateForm = () => {
    if (!formData.batchName.trim()) {
      setError('Batch name is required');
      return false;
    }
    if (!formData.courseId) {
      setError('Please select a course');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (formData.daysOfWeek.length === 0) {
      setError('Please select at least one day');
      return false;
    }
    if (!formData.classTiming) {
      setError('Class timing is required');
      return false;
    }

    return true;
  };

  const handleSaveBatch = () => {
    if (!validateForm()) {
      return;
    }

    let newBatches;
    if (editingIndex !== null) {
      newBatches = batches.map((batch, i) =>
        i === editingIndex ? formData : batch
      );
    } else {
      newBatches = [...batches, formData];
    }

    setBatches(newBatches);
    setShowForm(false);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setError('');
  };

  const handleNext = () => {
    onChange({ batches });
    onNext();
  };

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Batches & Schedule</h2>
          <p className="text-gray-600">Manage your batches and class schedules.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">No Courses Available</p>
            <p className="text-sm text-yellow-600 mt-1">
              Please add courses in Step 4 before creating batches. Batches need to be linked to courses.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Skip & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Batches & Schedule</h2>
        <p className="text-gray-600">Add and manage your batches and class schedules.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Batch List */}
      {!showForm && batches.length > 0 && (
        <div className="space-y-4">
          {batches.map((batch, index) => (
            <div key={batch.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{batch.batchName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{batch.courseName}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium text-gray-900">{batch.startDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Timing</p>
                        <p className="text-sm font-medium text-gray-900">{batch.classTiming}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Batch Size</p>
                        <p className="text-sm font-medium text-gray-900">{batch.batchSize || 'Not Set'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        batch.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                        batch.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                        batch.status === 'Full' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Days</p>
                    <p className="text-sm text-gray-900">{batch.daysOfWeek.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditBatch(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBatch(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Batch Button */}
      {!showForm && (
        <button
          type="button"
          onClick={handleAddBatch}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Batch</span>
        </button>
      )}

      {/* Batch Form */}
      {showForm && (
        <div className="bg-white border-2 border-blue-500 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingIndex !== null ? 'Edit Batch' : 'Add New Batch'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., NEET 2026 Morning Batch"
              />
            </div>

            {/* Course Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Days of Week */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <label
                    key={day}
                    className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.daysOfWeek.includes(day)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Class Timing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Timing <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.classTiming}
                onChange={(e) => setFormData({ ...formData, classTiming: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 9:00 AM - 11:00 AM"
              />
            </div>

            {/* Class Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Duration
              </label>
              <input
                type="text"
                value={formData.classDuration}
                onChange={(e) => setFormData({ ...formData, classDuration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2 hours"
              />
            </div>

            {/* Classes Per Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classes Per Week
              </label>
              <input
                type="number"
                value={formData.classesPerWeek}
                onChange={(e) => setFormData({ ...formData, classesPerWeek: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 5"
                min="0"
              />
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                value={formData.batchSize}
                onChange={(e) => setFormData({ ...formData, batchSize: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Total students"
                min="0"
              />
            </div>

            {/* Seats Available */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seats Available
              </label>
              <input
                type="number"
                value={formData.seatsAvailable}
                onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Available seats"
                min="0"
              />
            </div>

            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Type
              </label>
              <select
                value={formData.scheduleType}
                onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Schedule Type</option>
                {scheduleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Mode</option>
                {modes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Trial Available */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trialAvailable}
                  onChange={(e) => setFormData({ ...formData, trialAvailable: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Trial/Demo Available</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveBatch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingIndex !== null ? 'Update Batch' : 'Add Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {!showForm && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save & Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Step5Batches;
