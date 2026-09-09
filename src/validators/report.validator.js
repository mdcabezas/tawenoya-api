const createReportSchema = {
  validate: (data) => {
    const errors = [];

    if (!data.lat || isNaN(parseFloat(data.lat))) {
      errors.push('lat is required and must be a number');
    }
    if (!data.lng || isNaN(parseFloat(data.lng))) {
      errors.push('lng is required and must be a number');
    }
    if (!data.description || data.description.length > 180) {
      errors.push('description is required and must be 180 characters or less');
    }
    if (!data.tag_ids || !Array.isArray(data.tag_ids) || data.tag_ids.length === 0) {
      errors.push('tag_ids is required and must be a non-empty array');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

const updateStatusSchema = {
  validate: (data) => {
    const errors = [];
    const validStatuses = ['pending', 'reviewing', 'in_progress', 'resolved', 'rejected'];

    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push(`status is required and must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

module.exports = { createReportSchema, updateStatusSchema };
