// Only showing the relevant parts that need to be changed

/**
 * Delete a user and related records
 * @param {Object} req - Request object with user ID
 * @param {Object} res - Response object
 */
const deleteuser = async (req, res) => {
    try {
      const { userId } = req.body;
      
      // With Sequelize associations and cascade delete, we only need to delete the user
      // The associated doctor, appointments will be deleted automatically due to CASCADE
      await User.destroy({ where: { id: userId } });
      
      return res.status(200).send("User deleted successfully");
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).send("Unable to delete user");
    }
  };
  
  /**
   * Change user password
   * @param {Object} req - Request object with user ID, current password, new password
   * @param {Object} res - Response object
   */
  const changepassword = async (req, res) => {
    try {
      const { userId, currentPassword, newPassword, confirmNewPassword } = req.body;
      
      // Validate password match
      if (newPassword !== confirmNewPassword) {
        return res.status(400).send("Passwords do not match");
      }
      
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Verify current password
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordMatch) {
        return res.status(400).send("Incorrect current password");
      }
      
      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      
      // Use update method instead of direct property assignment
      await User.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );
      
      return res.status(200).send("Password changed successfully");
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).send("Internal Server Error");
    }
  };